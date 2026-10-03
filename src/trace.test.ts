import { beforeAll, describe, expect, it, vi } from 'vitest';
import { loadPyodide, type PyodideInterface } from 'pyodide';
import { buildTraceProgram, detectStructure, loadPython } from './trace';

type RawEvent = {
  step: number; line: number; statement: string; eventType: string; operation: string;
  function: string; dataStructure: string;
  variables: Record<string, unknown>; arguments: Record<string, unknown>;
  returnValue?: unknown; beforeState: Record<string, unknown>; afterState: Record<string, unknown>;
  lineComplexity: { time: string; timeDetails: string; space: string; spaceDetails: string };
  focus: { indices?: number[]; values?: unknown[]; result?: string; range?: number[]; cells?: number[][]; readCells?: number[][]; writeCells?: number[][]; direction?: string };
  callStack: Array<{ name: string; line: number; arguments: Record<string, unknown> }>;
  output?: string; explanation: string;
};

let python: PyodideInterface;
beforeAll(async () => { python = await loadPyodide(); }, 30_000);

async function run(code: string, eventLimit = 1000, executionTimeoutMs = 5000): Promise<RawEvent[]> {
  const result = await python.runPythonAsync(buildTraceProgram(code, eventLimit, executionTimeoutMs));
  return JSON.parse(String(result)) as RawEvent[];
}

describe('Python execution trace', () => {
  it('defaults to the production step and execution-time ceilings', () => {
    const program = buildTraceProgram('pass');
    expect(program).toContain('event_limit = 1000');
    expect(program).toContain('EXECUTION_TIMEOUT_MS = 5000');
  });

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

  it('reports runtime K and allocation for slices, reductions, and concatenation', async () => {
    const events = await run(`values = [1, 2, 3, 4, 5]\nsample = values[1:4]\ntotal = sum(values)\njoined = "a" + "bc"`);
    const slice = events.find(event => event.statement === 'sample = values[1:4]');
    expect(slice?.lineComplexity).toEqual({ time: 'O(K)', timeDetails: 'K = 3 elements copied by slicing', space: 'O(K)', spaceDetails: 'Allocated 3 new elements' });
    const sum = events.find(event => event.statement === 'total = sum(values)');
    expect(sum?.lineComplexity.time).toBe('O(K)');
    expect(sum?.lineComplexity.timeDetails).toContain('5 elements scanned');
    expect(sum?.lineComplexity.space).toBe('O(1)');
    const concatenate = events.find(event => event.statement === 'joined = "a" + "bc"');
    expect(concatenate?.lineComplexity.time).toBe('O(K)');
    expect(concatenate?.lineComplexity.space).toBe('O(K)');
  });

  it('counts allocation when a function returns a sliced collection', async () => {
    const events = await run(`def copy_range(values):\n    return values[1:4]\nanswer = copy_range([1, 2, 3, 4, 5])`);
    const returnedSlice = events.find(event => event.eventType === 'return' && event.statement === 'return values[1:4]');
    expect(returnedSlice?.lineComplexity).toEqual({ time: 'O(K)', timeDetails: 'K = 3 elements copied by slicing', space: 'O(K)', spaceDetails: 'Allocated 3 new elements' });
  });

  it('reports sort, append, pop, and user-call stack costs', async () => {
    const events = await run(`def add_item(items, value):\n    items.sort()\n    items.append(value)\n    return items.pop()\nvalues = [3, 1, 2]\nanswer = add_item(values, 4)`);
    const sort = events.find(event => event.statement === 'items.sort()');
    expect(sort?.lineComplexity.time).toBe('O(K log K)');
    expect(sort?.lineComplexity.space).toBe('O(1)');
    const push = events.find(event => event.statement === 'items.append(value)');
    expect(push?.lineComplexity.time).toBe('O(1)');
    const call = events.find(event => event.eventType === 'call' && event.function === 'add_item');
    expect(call?.lineComplexity).toEqual({ time: 'O(1)', timeDetails: 'One user-function invocation', space: 'O(1)', spaceDetails: 'Added one user-call stack frame' });
    expect(events.every(event => event.lineComplexity && event.lineComplexity.time && event.lineComplexity.space)).toBe(true);
  });

  it('uses the safe constant fallback instead of displaying an unknown complexity token', async () => {
    const events = await run(`def passthrough(items):\n    return items\nvalues = [1, 2, 3]\nresult = passthrough(values)`);
    const assignment = events.find(event => event.statement === 'result = passthrough(values)' && event.operation === 'assign');
    expect(assignment?.lineComplexity.time).toBe('O(1)');
    expect(assignment?.lineComplexity.space).toBe('O(1)');
    expect(assignment?.lineComplexity.timeDetails).toContain('Conservative fallback');
    expect(JSON.stringify(events)).not.toContain('O(?)');
  });

  it('tracks active string indices and slice characters during string-search comparisons', async () => {
    const events = await run(`text = "banana"\npattern = "ana"\nindex = 1\nif text[index:index + len(pattern)] == pattern:\n    found = index`);
    const comparison = events.find(event => event.eventType === 'compare');
    expect(comparison?.focus.indices).toEqual(expect.arrayContaining([1, 2, 3]));
    expect(comparison?.focus.values).toEqual(expect.arrayContaining(['n', 'a']));
    const advance = await run(`text = "banana"\nindex = 0\nindex += 1`);
    expect(advance.find(event => event.statement === 'index += 1')?.focus.indices).toContain(1);
  });

  it('uses the pre-mutation list size for front insert and pop costs', async () => {
    const events = await run(`items = [1, 2, 3, 4, 5]\nitems.insert(0, 0)\nitems.pop(0)`);
    const insert = events.find(event => event.statement === 'items.insert(0, 0)');
    const pop = events.find(event => event.statement === 'items.pop(0)');
    expect(insert?.lineComplexity.time).toBe('O(K)');
    expect(insert?.lineComplexity.timeDetails).toContain('K = 5');
    expect(insert?.lineComplexity.space).toBe('O(1)');
    expect(pop?.lineComplexity.time).toBe('O(K)');
    expect(pop?.lineComplexity.timeDetails).toContain('K = 6');
    expect(pop?.lineComplexity.space).toBe('O(1)');
  });

  it('estimates generator scans and heap work from runtime collection sizes', async () => {
    const events = await run(`values = [1, 2, 3, 4]\ntotal = sum(value for value in values)\nimport heapq\nheap = [7, 2, 5]\nheapq.heapify(heap)\nheapq.heappush(heap, 1)`);
    const sum = events.find(event => event.statement === 'total = sum(value for value in values)');
    expect(sum?.lineComplexity.time).toBe('O(K)');
    expect(sum?.lineComplexity.timeDetails).toContain('4 elements scanned');
    const heapify = events.find(event => event.statement === 'heapq.heapify(heap)');
    expect(heapify?.lineComplexity.time).toBe('O(K)');
    expect(heapify?.lineComplexity.space).toBe('O(1)');
    const push = events.find(event => event.statement === 'heapq.heappush(heap, 1)');
    expect(push?.lineComplexity.time).toBe('O(log K)');
    expect(push?.lineComplexity.space).toBe('O(1)');
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
    expect(events.every(event => event.dataStructure === 'graph')).toBe(true);
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
    expect(detectStructure({ statement: pop?.statement || '', state: pop?.afterState || {}, callStack: pop?.callStack || [] }, `@visualize stack pile\npile = []\npile.append("bottom")\npile.pop()`)).toBe('stack');
  });

  it('recognizes a custom-named stack during iterative BST inorder traversal with node objects', async () => {
    const code = `class Node:\n    def __init__(self, value):\n        self.value = value\n        self.left = None\n        self.right = None\nroot = Node(2)\nroot.left = Node(1)\nroot.right = Node(3)\npending = []\ncurrent = root\nresult = []\nwhile current or pending:\n    while current:\n        pending.append(current)\n        current = current.left\n    current = pending.pop()\n    result.append(current.value)\n    current = current.right`;
    const events = await run(code);
    const stackEvent = events.find(event => event.operation === 'push');
    expect(stackEvent).toBeDefined();
    expect(detectStructure({ statement: stackEvent!.statement, state: stackEvent!.afterState, callStack: stackEvent!.callStack }, code)).toBe('tree');
    expect(stackEvent?.dataStructure).toBe('tree');
    const stackOperations = events.filter(event => ['push', 'pop'].includes(event.operation));
    expect(stackOperations.map(event => event.operation)).toEqual(['push', 'push', 'pop', 'pop', 'push', 'pop']);
    expect(stackEvent?.afterState.pending).toEqual([expect.objectContaining({ __type__: 'Node', value: 2 })]);
    expect(stackOperations.at(-1)?.afterState.pending).toEqual([]);
    expect(events.every(event => event.dataStructure === 'tree')).toBe(true);
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

  it('serializes deeply nested custom objects even when repr raises', async () => {
    const events = await run(`class Node:\n    def __init__(self, value, child=None):\n        self.value = value\n        self.child = child\n    def __repr__(self):\n        raise RuntimeError("repr unavailable")\nroot = None\nfor value in range(8):\n    root = Node(value, root)\nroot.child.child.child.child.child.child.child.child = root\nmetrics = {"nan": float("nan"), "infinity": float("inf")}\nanswer = root.value`);
    expect(events.at(-1)?.eventType).toBe('complete');
    expect(events.some(event => event.afterState.root && JSON.stringify(event.afterState.root).includes('<Node>'))).toBe(true);
    expect(events.some(event => (event.afterState.root as Record<string, unknown> | undefined)?.child)).toBe(true);
    expect(events.some(event => JSON.stringify(event.afterState.metrics) === '{"nan":"nan","infinity":"inf"}')).toBe(true);
    expect(JSON.stringify(events)).not.toContain('repr unavailable');
  });

  it('bounds high-branching snapshots and keeps the trace JSON parseable', async () => {
    const events = await run(`payload = {str(index): list(range(100)) for index in range(80)}\nanswer = len(payload)`);
    expect(events.at(-1)?.eventType).toBe('complete');
    expect(JSON.stringify(events)).toContain('<state truncated>');
    expect(events.some(event => event.statement === 'answer = len(payload)' && event.afterState.answer === 80)).toBe(true);
  });

  it('keeps bitwise, set, mapping and multidimensional updates as generic atomic events', async () => {
    const events = await run(`mask = 10\nmask ^= 3\nmask |= 16\ntable = [[0, 0], [0, 0]]\nrow, col = 1, 0\ntable[row][col] = mask\nseen = set()\nseen.add(mask)\ncounts = {}\ncounts[mask] = 1\ncounts[mask] += 1`);
    expect(events.filter(event => event.statement === 'mask ^= 3' || event.statement === 'mask |= 16').map(event => event.operation)).toEqual(['assign', 'assign']);
    const tableWrites = events.filter(event => event.statement === 'table[row][col] = mask');
    expect(tableWrites).toHaveLength(1);
    expect(tableWrites[0].afterState.table).toEqual([[0, 0], [25, 0]]);
    expect(events.some(event => event.statement === 'seen.add(mask)' && (event.afterState.seen as unknown[] | undefined)?.includes(25))).toBe(true);
    expect(events.some(event => event.statement === 'counts[mask] = 1' && (event.afterState.counts as Record<string, unknown> | undefined)?.['25'] === 1)).toBe(true);
    expect(events.some(event => event.statement === 'counts[mask] += 1' && (event.afterState.counts as Record<string, unknown> | undefined)?.['25'] === 2)).toBe(true);
  });

  it('points syntax errors with a pasted literal newline escape back to the editor line', async () => {
    const badSource = String.raw`print(json.dumps(events))\njson.dumps(events)`;
    const events = await run(badSource);
    const error = events.at(-1);
    expect(error?.eventType).toBe('error');
    expect(error?.line).toBe(1);
    expect(error?.statement).toBe(badSource);
    expect(error?.explanation).toContain('Replace it with an actual line break');
    expect(error?.lineComplexity).toBeDefined();
  });

  it('stops a non-terminating loop at the event limit and marks it as an error', async () => {
    const events = await run('while True:\n    pass', 60);
    expect(events.length).toBeLessThanOrEqual(60);
    expect(events.at(-1)?.eventType).toBe('error');
    expect(events.at(-1)?.explanation).toContain('60 meaningful events');
  });

  it('stops execution at the configured wall-clock deadline', async () => {
    const events = await run('while True:\n    pass', 1000, 25);
    expect(events.length).toBeLessThanOrEqual(1000);
    expect(events.at(-1)?.eventType).toBe('error');
    expect(events.at(-1)?.explanation).toContain('timed out after 0.025 seconds');
  });

  it('stops runaway recursion with a valid terminal error event', async () => {
    const events = await run(`def descend(depth):\n    return descend(depth + 1)\ndescend(0)`);
    expect(events.at(-1)?.eventType).toBe('error');
    expect(events.at(-1)?.explanation).toContain('128 nested user calls');
    expect(events.every((event, index) => event.step === index + 1)).toBe(true);
  });

  it('replays the same program in a deterministic event order', async () => {
    const code = `values = [4, 2]\nif values[0] > values[1]:\n    values[0], values[1] = values[1], values[0]`;
    const first = await run(code);
    const second = await run(code);
    const sequence = (events: RawEvent[]) => events.map(({ step, line, eventType, operation, beforeState, afterState }) => ({ step, line, eventType, operation, beforeState, afterState }));
    expect(sequence(first)).toEqual(sequence(second));
  });

  it('filters non-algorithmic sorting trace noise without changing the event schema', async () => {
    const events = await run(`def bubble_sort(values):\n    for end in range(len(values) - 1, 0, -1):\n        for index in range(end):\n            if values[index] > values[index + 1]:\n                values[index], values[index + 1] = values[index + 1], values[index]\nvalues = [5, 1, 4, 2, 8]\nbubble_sort(values)\nprint(values)`);
    expect(events.length).toBe(45);
    expect(events[0].eventType).toBe('call');
    expect(events[0].function).toBe('bubble_sort');
    expect(events.some(event => event.eventType === 'line' || ['read', 'lookup'].includes(event.operation))).toBe(false);
    expect(events.some(event => /^(from |import |def |class )/.test(event.statement.trim()))).toBe(false);
    expect(events.some(event => event.eventType === 'call' && ['len', 'range', 'print'].includes(event.function))).toBe(false);
    expect(events.some(event => event.operation === 'swap')).toBe(true);
    expect(events.at(-1)?.eventType).toBe('complete');
    expect(Object.keys(events[0])).toEqual(expect.arrayContaining(['step', 'eventType', 'line', 'beforeState', 'afterState', 'variables', 'focus']));
  });

  it('treats comprehensions as single assignments and omits implicit None returns', async () => {
    const events = await run(`from math import floor\ndef summarize(values):\n    doubled = [value * 2 for value in values]\n    total = sum(value for value in doubled)\n    return total\ndef setup_only():\n    pass\nanswer = summarize([1, 2, 3])\nsetup_only()`);
    expect(events[0].eventType).toBe('call');
    expect(events[0].function).toBe('summarize');
    const doubled = events.find(event => event.statement.startsWith('doubled ='));
    expect(events.filter(event => event.statement.startsWith('doubled =')).length).toBe(1);
    expect(doubled?.variables.value).toBeUndefined();
    expect(events.some(event => ['<listcomp>', '<dictcomp>', '<setcomp>', '<genexpr>'].includes(event.function))).toBe(false);
    expect(events.some(event => event.statement.startsWith('from math import'))).toBe(false);
    expect(events.some(event => event.eventType === 'return' && event.function === 'summarize' && event.returnValue === 12)).toBe(true);
    expect(events.some(event => event.eventType === 'return' && event.function === 'setup_only')).toBe(false);
  });

  it('omits imports and uncalled function definitions from top-level traces', async () => {
    const events = await run(`from math import floor\ndef unused(value):\n    return floor(value)\nvalues = [3, 1]`);
    expect(events[0].statement).toBe('values = [3, 1]');
    expect(events.some(event => /^(from |import |def |class )/.test(event.statement.trim()))).toBe(false);
    expect(events.some(event => event.statement === 'values = [3, 1]' && event.operation === 'assign')).toBe(true);
  });

  it('omits if __name__ == "__main__" boilerplate and filters class objects from variables', async () => {
    const code = `class ListNode(object):
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution(object):
    def removeElements(self, head, val):
        dummy = ListNode(-1)
        dummy.next = head
        p = dummy
        while p.next:
            if p.next.val == val:
                p.next = p.next.next
            else:
                p = p.next
        return dummy.next

if __name__ == "__main__":
    node1 = ListNode(1)
    node2 = ListNode(2)
    node1.next = node2
    sol = Solution()
    res = sol.removeElements(node1, 2)
`;
    const events = await run(code);
    expect(events.length).toBeGreaterThan(0);
    // Step 1 should be node1 = ListNode(1), not if __name__ == "__main__":
    expect(events[0].statement).toBe('node1 = ListNode(1)');
    expect(['call', 'assign']).toContain(events[0].operation);
    expect(events.some(event => event.statement.includes('__name__'))).toBe(false);
    // Class definitions ListNode and Solution must not appear as variables
    for (const ev of events) {
      expect(ev.variables.ListNode).toBeUndefined();
      expect(ev.variables.Solution).toBeUndefined();
    }
  });

  it('serializes 7+ node linked lists with duplicate node values without depth truncation', async () => {
    const code = `class ListNode(object):
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

node1 = ListNode(1)
node2 = ListNode(2)
node3 = ListNode(6)
node4 = ListNode(3)
node5 = ListNode(4)
node6 = ListNode(5)
node7 = ListNode(6)

node1.next = node2
node2.next = node3
node3.next = node4
node4.next = node5
node5.next = node6
node6.next = node7
head = node1
`;
    const events = await run(code);
    const lastEvent = events.at(-1)!;
    expect(lastEvent).toBeDefined();

    // Traverse head to ensure node7 is reached and is a full object, not a string
    let current: any = lastEvent.afterState.head;
    const values: number[] = [];
    const ids: string[] = [];
    while (current && typeof current === 'object') {
      values.push(current.val);
      ids.push(current.__id__);
      current = current.next;
    }
    expect(values).toEqual([1, 2, 6, 3, 4, 5, 6]);
    expect(ids).toHaveLength(7);
    // Node 3 and Node 7 both have val 6, but must have distinct identities
    expect(ids[2]).not.toBe(ids[6]);
  });
});
