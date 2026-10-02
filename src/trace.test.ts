import { beforeAll, describe, expect, it, vi } from 'vitest';
import { loadPyodide, type PyodideInterface } from 'pyodide';
import { buildTraceProgram, detectStructure, loadPython } from './trace';

type RawEvent = {
  step: number; line: number; statement: string; eventType: string; operation: string;
  function: string;
  variables: Record<string, unknown>; arguments: Record<string, unknown>;
  returnValue?: unknown; beforeState: Record<string, unknown>; afterState: Record<string, unknown>;
  focus: { indices?: number[]; values?: unknown[]; result?: string; range?: number[]; cells?: number[][]; readCells?: number[][]; writeCells?: number[][]; direction?: string };
  callStack: Array<{ name: string; line: number; arguments: Record<string, unknown> }>;
  output?: string; explanation: string;
};

let python: PyodideInterface;
beforeAll(async () => { python = await loadPyodide(); }, 30_000);

async function run(code: string, eventLimit = 12_000): Promise<RawEvent[]> {
  const result = await python.runPythonAsync(buildTraceProgram(code, eventLimit));
  return JSON.parse(String(result)) as RawEvent[];
}

describe('Python execution trace', () => {
  it('loads the browser Python runtime only once for repeated runs', async () => {
    const runtime = { runPythonAsync: vi.fn(async () => null) };
    const loadPyodide = vi.fn(async () => runtime);
    const previousDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'loadPyodide');
    Object.defineProperty(globalThis, 'loadPyodide', { configurable: true, value: loadPyodide });
    try {
      const first = loadPython();
      const second = loadPython();
      expect(first).toBe(second);
      await expect(first).resolves.toBe(runtime);
      expect(loadPyodide).toHaveBeenCalledTimes(1);
    } finally {
      if (previousDescriptor) Object.defineProperty(globalThis, 'loadPyodide', previousDescriptor);
      else delete (globalThis as typeof globalThis & { loadPyodide?: unknown }).loadPyodide;
    }
  });

  it('selects queue and deque adapters from ordinary names and explicit annotations', () => {
    const event = (state: Record<string, unknown>) => ({ statement: '', state, callStack: [] });
    expect(detectStructure(event({ queue: [] }), 'from collections import deque\nqueue = deque()')).toBe('queue');
    expect(detectStructure(event({ dq: [] }), 'from collections import deque\ndq = deque()')).toBe('deque');
    expect(detectStructure(event({ worklist: [] }), '@visualize deque worklist\nworklist = []')).toBe('deque');
    expect(detectStructure(event({ graph: { A: ['B'], B: [] } }), 'graph = {"A": ["B"], "B": []}')).toBe('graph');
  });

  it('captures every search comparison, source branch, focus value and range update', async () => {
    const events = await run(`values = [2, 5, 8, 12, 16]\ntarget = 12\nleft, right = 0, len(values) - 1\nwhile left <= right:\n    middle = (left + right) // 2\n    if values[middle] == target:\n        found = middle\n        break\n    elif values[middle] < target:\n        left = middle + 1\n    else:\n        right = middle - 1`);
    const comparisons = events.filter(event => event.eventType === 'compare');
    const branches = events.filter(event => event.eventType === 'branch');
    expect(comparisons.length).toBeGreaterThanOrEqual(3);
    expect(comparisons.some(event => event.focus.values?.includes(12))).toBe(true);
    expect(branches.some(event => event.focus.result === 'taken')).toBe(true);
    expect(branches.some(event => event.focus.result === 'not taken')).toBe(true);
    expect(events.some(event => event.focus.range?.[0] === 0 && event.focus.range?.[1] === 4)).toBe(true);
    expect(events.at(-1)?.eventType).toBe('complete');
  });

  it('records an array swap as a replayable before/after transition', async () => {
    const events = await run(`values = [3, 1]\nif values[0] > values[1]:\n    values[0], values[1] = values[1], values[0]`);
    const comparison = events.find(event => event.eventType === 'compare');
    const swap = events.filter(event => event.eventType === 'swap').at(-1);
    expect(comparison?.focus.indices).toEqual([0, 1]);
    expect(comparison?.focus.values).toEqual([3, 1]);
    expect(swap?.beforeState.values).toEqual([3, 1]);
    expect(swap?.afterState.values).toEqual([1, 3]);
    expect(swap?.variables.values).toEqual([1, 3]);
  });

  it('traces insertion-sort shifts as moves and finishes with the sorted result', async () => {
    const events = await run(`values = [7, 3, 5, 1]\nfor index in range(1, len(values)):\n    current = values[index]\n    position = index\n    while position > 0 and values[position - 1] > current:\n        values[position] = values[position - 1]\n        position -= 1\n    values[position] = current`);
    const moves = events.filter(event => event.operation === 'move');
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every(event => event.focus.indices && event.focus.indices.length >= 2)).toBe(true);
    expect(events.at(-1)?.afterState.values).toEqual([1, 3, 5, 7]);
  });

  it('captures queue mutations and print output as distinct events', async () => {
    const events = await run(`from collections import deque\nqueue = deque()\nqueue.append("A")\nfront = queue.popleft()\nprint(front)`);
    expect(events.some(event => event.operation === 'enqueue' && (event.afterState.queue as unknown[] | undefined)?.[0] === 'A')).toBe(true);
    expect(events.some(event => event.operation === 'dequeue' && Array.isArray(event.afterState.queue) && (event.afterState.queue as unknown[]).length === 0)).toBe(true);
    expect(events.find(event => event.output)?.output).toBe('A\n');
  });

  it('records graph discovery and frontier insertion from executed BFS operations', async () => {
    const events = await run(`from collections import deque\ngraph = {"A": ["B"], "B": []}\nvisited = {"A"}\nqueue = deque(["A"])\nwhile queue:\n    node = queue.popleft()\n    for neighbor in graph[node]:\n        if neighbor not in visited:\n            visited.add(neighbor)\n            queue.append(neighbor)`);
    const discovered = events.find(event => event.operation === 'discover');
    const enqueued = events.find(event => event.operation === 'enqueue' && Array.isArray(event.afterState.queue) && (event.afterState.queue as unknown[]).includes('B'));
    expect(discovered?.afterState.visited).toContain('B');
    expect(enqueued?.afterState.queue).toEqual(['B']);
    expect(discovered?.variables.node).toBe('A');
    expect(discovered?.variables.neighbor).toBe('B');
  });

  it('records shortest-path relaxations with the graph edge context and new distance map', async () => {
    const events = await run(`graph = {"A": {"B": 4}, "B": {}}\ndistances = {"A": 0}\ndistances["B"] = distances["A"] + graph["A"]["B"]`);
    const relax = events.find(event => event.operation === 'relax');
    expect(relax?.beforeState.distances).toEqual({ A: 0 });
    expect(relax?.afterState.distances).toEqual({ A: 0, B: 4 });
    expect(detectStructure({ statement: '', state: relax?.afterState || {}, callStack: [] }, 'graph = {"A": {"B": 4}}')).toBe('graph');
  });

  it('distinguishes deque operations at both ends and records the affected side', async () => {
    const events = await run(`from collections import deque\ndq = deque(["middle"])\ndq.appendleft("front")\ndq.append("rear")\nleft = dq.popleft()\nright = dq.pop()`);
    const operations = events.filter(event => /^(enqueue|dequeue)-/.test(event.operation));
    expect(operations.map(event => event.operation)).toEqual(['enqueue-left', 'enqueue-right', 'dequeue-left', 'dequeue-right']);
    expect(operations.map(event => event.focus.direction)).toEqual(['left', 'right', 'left', 'right']);
    expect(operations.map(event => event.afterState.dq)).toEqual([
      ['front', 'middle'], ['front', 'middle', 'rear'], ['middle', 'rear'], ['middle'],
    ]);
  });

  it('accepts the optional visualizer annotation while preserving source line numbers', async () => {
    const events = await run(`@visualize queue q\nfrom collections import deque\nq = deque()\nq.append("node")`);
    const enqueue = events.find(event => event.operation === 'enqueue');
    expect(enqueue?.line).toBe(4);
    expect(enqueue?.afterState.q).toEqual(['node']);
  });

  it('uses annotations to recognize stack operations on custom variable names', async () => {
    const events = await run(`@visualize stack pile\npile = []\npile.append("bottom")\npile.append("top")\nitem = pile.pop()`);
    const pushes = events.filter(event => event.operation === 'push');
    const pop = events.find(event => event.operation === 'pop');
    expect(pushes.map(event => event.afterState.pile)).toEqual([['bottom'], ['bottom', 'top']]);
    expect(pop?.afterState.pile).toEqual(['bottom']);
    expect(pop?.afterState.item).toBe('top');
  });

  it('distinguishes indexed moves, writes, mapping inserts, updates, and deletes', async () => {
    const events = await run(`values = [4, 1]\nvalues[0] = values[1]\nvalues[1] = 9\ntable = {}\ntable["key"] = 1\ntable["key"] = 2\ndel table["key"]`);
    const transitions = events.filter(event => ['move', 'write', 'insert', 'update', 'delete'].includes(event.operation));
    expect(transitions.map(event => event.operation)).toEqual(['move', 'write', 'insert', 'update', 'delete']);
    expect(transitions[0].beforeState.values).toEqual([4, 1]);
    expect(transitions[0].afterState.values).toEqual([1, 1]);
    expect(transitions[2].afterState.table).toEqual({ key: 1 });
    expect(transitions[3].afterState.table).toEqual({ key: 2 });
    expect(transitions[4].afterState.table).toEqual({});
  });

  it('marks nested table writes and focuses the exact row and column', async () => {
    const events = await run(`dp = [[0, 0], [0, 0]]\nrow = 1\ncol = 1\ndp[row][col] = dp[row - 1][col] + 1`);
    const write = events.find(event => event.operation === 'table-write');
    expect(write?.focus.cells).toContainEqual([1, 1]);
    expect(write?.focus.writeCells).toContainEqual([1, 1]);
    expect(write?.focus.readCells).toEqual([[0, 1]]);
    expect(write?.afterState.dp).toEqual([[0, 0], [0, 1]]);
  });

  it('captures recursive arguments, stack depth and return values', async () => {
    const events = await run(`def count_down(n):\n    if n == 0:\n        return 0\n    return count_down(n - 1) + 1\nanswer = count_down(3)`);
    const calls = events.filter(event => event.eventType === 'call' && event.function === 'count_down');
    const returns = events.filter(event => event.eventType === 'return' && event.function === 'count_down');
    expect(calls.length).toBe(4);
    expect(Math.max(...calls.map(event => event.callStack.filter(frame => frame.name === 'count_down').length))).toBe(4);
    expect(calls[0].arguments.n).toBe(3);
    expect(returns.map(event => event.returnValue)).toContain(3);
  });

  it('preserves custom object state and reports exceptions at the end of the trace', async () => {
    const events = await run(`class Node:\n    def __init__(self, value):\n        self.value = value\n        self.next = None\nhead = Node(1)\nhead.next = Node(2)\nhead.next = 1 / 0`);
    expect(events.some(event => JSON.stringify(event.afterState.head ?? '').includes('"value":2'))).toBe(true);
    expect(events.at(-1)?.eventType).toBe('error');
    expect(events.at(-1)?.explanation).toContain('division by zero');
  });

  it('preserves identity for distinct linked nodes that contain duplicate values', async () => {
    const events = await run(`class Node:\n    def __init__(self, value):\n        self.value = value\n        self.next = None\nhead = Node(1)\nhead.next = Node(1)\ncurrent = head.next`);
    const pointer = events.filter(event => event.statement === 'current = head.next').at(-1);
    const head = pointer?.afterState.head as Record<string, unknown> | undefined;
    const current = pointer?.variables.current as Record<string, unknown> | undefined;
    const next = head?.next as Record<string, unknown> | undefined;
    expect(head?.__id__).not.toBe(next?.__id__);
    expect(current?.__id__).toBe(next?.__id__);
  });

  it('points syntax errors with a pasted literal newline escape back to the editor line', async () => {
    const badSource = String.raw`print(json.dumps(events))\njson.dumps(events)`;
    const events = await run(badSource);
    const error = events.at(-1);
    expect(error?.eventType).toBe('error');
    expect(error?.line).toBe(1);
    expect(error?.statement).toBe(badSource);
    expect(error?.explanation).toContain('Replace it with an actual line break');
  });

  it('stops a non-terminating loop at the event limit and marks it as an error', async () => {
    const events = await run('while True:\n    pass', 60);
    expect(events.at(-1)?.eventType).toBe('error');
    expect(events.at(-1)?.explanation).toContain('60 meaningful events');
  });

  it('replays the same program in a deterministic event order', async () => {
    const code = `values = [4, 2]\nif values[0] > values[1]:\n    values[0], values[1] = values[1], values[0]`;
    const first = await run(code);
    const second = await run(code);
    const sequence = (events: RawEvent[]) => events.map(({ step, line, eventType, operation, beforeState, afterState }) => ({ step, line, eventType, operation, beforeState, afterState }));
    expect(sequence(first)).toEqual(sequence(second));
  });
});
