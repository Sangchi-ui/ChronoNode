import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Editor from '@monaco-editor/react';
import { AlertCircle, BookOpen, ChevronLeft, ChevronRight, Code2, GitBranch, Layers, Pause, Play, RotateCcw, SkipBack, SkipForward, Sliders, Sparkles } from 'lucide-react';
import { tracePython, type TraceEvent } from './trace';
import { resolveVisualizerRoute, type VisualizerRoute } from './visualizer-routing';
import { PanZoomCanvas } from './PanZoomCanvas';
import { AlgorithmsPanel } from './AlgorithmsPanel';
import { AlgorithmDetailPage } from './AlgorithmDetailPage';
import { SandboxMode } from './SandboxMode';
import { LiveVariableTweaker } from './LiveVariableTweaker';
import { EdgeCaseModal } from './EdgeCaseModal';
import { ComplexityOdometer } from './ComplexityOdometer';
import { allAlgorithms, type AlgorithmData } from './data/algorithms';
import './styles.css';
import './algorithms.css';
import './interactive-features.css';
import './deque.css';
import './graph.css';
import './matrix.css';
import './motion.css';
import './linked.css';

const samples: Record<string, string> = {
  'Binary search': `values = [2, 5, 8, 12, 16, 21, 30]\ntarget = 16\nleft, right = 0, len(values) - 1\nwhile left <= right:\n    middle = (left + right) // 2\n    if values[middle] == target:\n        print("found", middle)\n        break\n    elif values[middle] < target:\n        left = middle + 1\n    else:\n        right = middle - 1`,
  'Bubble sort': `values = [7, 3, 9, 1, 5]\nfor end in range(len(values) - 1, 0, -1):\n    for index in range(end):\n        if values[index] > values[index + 1]:\n            values[index], values[index + 1] = values[index + 1], values[index]\nprint(values)`,
  'Selection sort': `values = [8, 4, 6, 2, 9]\nfor start in range(len(values)):\n    smallest = start\n    for index in range(start + 1, len(values)):\n        if values[index] < values[smallest]:\n            smallest = index\n    values[start], values[smallest] = values[smallest], values[start]`,
  'Insertion sort': `values = [7, 3, 9, 1, 5]\nfor index in range(1, len(values)):\n    current = values[index]\n    position = index\n    while position > 0 and values[position - 1] > current:\n        values[position] = values[position - 1]\n        position -= 1\n    values[position] = current\nprint(values)`,
  'Stack': `stack = []\nstack.append("learn")\nstack.append("build")\ntop = stack[-1]\nitem = stack.pop()\nprint(item)`,
  'Queue': `from collections import deque\nqueue = deque(["first", "second"])\nqueue.append("third")\ncurrent = queue.popleft()\nprint(current)`,
  'Deque': `from collections import deque\nworklist = deque(["middle"])\nworklist.appendleft("front")\nworklist.append("rear")\nleft_item = worklist.popleft()\nright_item = worklist.pop()\nprint(left_item, right_item)`,
  'Recursion': `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nanswer = factorial(4)\nprint(answer)`,
  'Graph BFS': `from collections import deque\ngraph = {"A": ["B", "C"], "B": ["D"], "C": ["E"], "D": [], "E": []}\nvisited = {"A"}\nqueue = deque(["A"])\nwhile queue:\n    node = queue.popleft()\n    for neighbor in graph[node]:\n        if neighbor not in visited:\n            visited.add(neighbor)\n            queue.append(neighbor)`,
  'Dijkstra': `import heapq\ngraph = {"A": {"B": 4, "C": 2}, "B": {"A": 4, "C": 1, "D": 5}, "C": {"A": 2, "B": 1, "D": 8}, "D": {"B": 5, "C": 8}}\ndistances = {"A": 0}\nprevious = {}\nfrontier = [(0, "A")]\nwhile frontier:\n    distance, node = heapq.heappop(frontier)\n    if distance > distances.get(node, float("inf")):\n        continue\n    for neighbor, weight in graph[node].items():\n        candidate = distance + weight\n        if candidate < distances.get(neighbor, float("inf")):\n            distances[neighbor] = candidate\n            previous[neighbor] = node\n            heapq.heappush(frontier, (candidate, neighbor))\nprint(distances)`,
  'DP table': `cost = [[0 for _ in range(4)] for _ in range(3)]\nfor row in range(3):\n    for col in range(4):\n        if row == 0 or col == 0:\n            cost[row][col] = 1\n        else:\n            cost[row][col] = cost[row - 1][col] + cost[row][col - 1]`,
  'String search': `text = "trace the pattern"\npattern = "pattern"\nfor index in range(len(text) - len(pattern) + 1):\n    if text[index:index + len(pattern)] == pattern:\n        found_at = index\n        break`,
  'Linked list': `class Node:\n    def __init__(self, value):\n        self.value = value\n        self.next = None\nhead = Node(10)\nhead.next = Node(20)\nhead.next.next = Node(30)\ncurrent = head\nwhile current:\n    current = current.next`,
  'Binary tree': `class Node:\n    def __init__(self, value):\n        self.value = value\n        self.left = None\n        self.right = None\nroot = Node(8)\nroot.left = Node(3)\nroot.right = Node(11)\nroot.left.left = Node(1)\ncurrent = root\ntarget = 3\nif target < current.value:\n    current = current.left`,
  'Hash table': `hash_table = {}\nhash_table["Ada"] = 90\nhash_table["Lin"] = 95\nscore = hash_table.get("Ada")\ndel hash_table["Ada"]`,
  'Heap': `import heapq\nheap = [7, 2, 8, 1]\nheapq.heapify(heap)\nheapq.heappush(heap, 3)\nsmallest = heapq.heappop(heap)`,
};
const initial = samples['Binary search'];
const pretty = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return `[${value.slice(0, 6).map(pretty).join(', ')}${value.length > 6 ? ', …' : ''}]`;
  const record = value as Record<string, unknown>;
  const payload = record.key ?? record.val ?? record.value ?? record.data;
  if (payload !== undefined) return `${String(record.__type__ ?? 'Node')}(${pretty(payload)})`;
  const entries = Object.entries(record).filter(([key]) => !key.startsWith('__'));
  return `${String(record.__type__ ?? 'Object')} · ${entries.length} field${entries.length === 1 ? '' : 's'}`;
};

function findArray(state: Record<string, unknown>, structure: string, source: string): [string, unknown[]] | undefined {
  const entries = Object.entries(state);
  const annotationName = source.match(/@visualize\s+[\w-]+\s+(\w+)/i)?.[1];
  if (annotationName && Array.isArray(state[annotationName])) return [annotationName, state[annotationName] as unknown[]];
  if (structure === 'stack') {
    const pushes = new Set(Array.from(source.matchAll(/\b([A-Za-z_]\w*)\s*\.\s*(?:append|push)\s*\(/g), match => match[1]));
    const pops = new Set(Array.from(source.matchAll(/\b([A-Za-z_]\w*)\s*\.\s*pop\s*\(/g), match => match[1]));
    const stackName = [...pushes].find(name => pops.has(name) && Array.isArray(state[name]));
    if (stackName) return [stackName, state[stackName] as unknown[]];
    const namedStack = entries.find(([name, value]) => Array.isArray(value) && ['stack', 'st'].includes(name.toLowerCase()));
    if (namedStack) return [namedStack[0], namedStack[1] as unknown[]];
  }
  const named = entries.find(([name, value]) => Array.isArray(value) && (name === 'values' || name === 'arr' || name === 'array' || name === 'data' || name === 'cost' || name === 'dp'));
  const any = named || entries.find(([, value]) => Array.isArray(value));
  if (!any || structure === 'graph') return undefined;
  return [any[0], any[1] as unknown[]];
}

function structureItemLabel(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return String(value);
  const record = value as Record<string, unknown>;
  const nodeValue = record.key ?? record.val ?? record.value ?? record.data;
  if (nodeValue !== undefined) {
    const label = typeof record.__type__ === 'string' ? record.__type__ : 'Node';
    return `${label}(${pretty(nodeValue)})`;
  }
  if (typeof record.__type__ === 'string') return record.__type__;
  return `Object · ${Object.keys(record).filter(key => !key.startsWith('__')).length} fields`;
}

function findString(state: Record<string, unknown>): [string, string] | undefined {
  return Object.entries(state).find(([name, value]) => typeof value === 'string' && value.length > 0 && name !== '__name__') as [string, string] | undefined;
}

function findObject(state: Record<string, unknown>, field: string): [string, Record<string, unknown>] | undefined {
  return Object.entries(state).find(([, value]) => !!value && typeof value === 'object' && !Array.isArray(value) && field in value) as [string, Record<string, unknown>] | undefined;
}

function findTypedObject(state: Record<string, unknown>): [string, Record<string, unknown>] | undefined {
  return Object.entries(state).find(([, value]) => !!value && typeof value === 'object' && !Array.isArray(value) && typeof (value as Record<string, unknown>).__type__ === 'string') as [string, Record<string, unknown>] | undefined;
}

function ArrayView({ event, value, name, animate }: { event: TraceEvent; value: unknown[]; name: string; animate: boolean }) {
  if (value.some(Array.isArray)) {
    const readCells = new Set((event.focus.readCells || []).map(([row, col]) => `${row},${col}`));
    const writeCells = new Set((event.focus.writeCells || []).map(([row, col]) => `${row},${col}`));
    const focusedCells = new Set((event.focus.cells || []).map(([row, col]) => `${row},${col}`));
    return <div className="matrix" key={event.step}>{value.map((row, r) => <div className="matrix-row" key={r}>{(Array.isArray(row) ? row : [row]).map((cell, c) => {
      const key = `${r},${c}`;
      const active = focusedCells.has(key) || (event.focus.indices?.includes(r) && event.focus.indices?.includes(c));
      return <div className={`matrix-cell ${readCells.has(key) ? 'is-read' : ''} ${writeCells.has(key) ? 'is-written' : ''} ${active ? 'is-focused' : ''}`} key={key}><small>{r},{c}</small><b>{String(cell)}</b></div>;
    })}</div>)}</div>;
  }
  const compared = new Set(event.focus.indices || []);
  const range = event.focus.range;
  const previous = event.beforeState[name];
  const changed = new Set(Array.isArray(previous) ? value.flatMap((item, index) => JSON.stringify(previous[index]) !== JSON.stringify(item) ? [index] : []) : []);
  const motion = new Map<number, number>();
  const [first, second] = event.focus.indices || [];
  if (event.operation === 'swap' && first !== undefined && second !== undefined) {
    motion.set(first, (second - first) * 63);
    motion.set(second, (first - second) * 63);
  } else if (event.operation === 'move' && first !== undefined && second !== undefined) {
    motion.set(first, (second - first) * 63);
  }
  return <div className="array-view">
    <div className="array-label">{name}</div>
    {value.slice(0, 80).map((item, index) => <div className={`array-cell ${range && (index < range[0] || index > range[1]) ? 'is-eliminated' : ''} ${compared.has(index) ? 'is-focused' : ''} ${event.operation === 'swap' && compared.has(index) ? 'is-moved' : ''} ${event.operation === 'compare' && compared.has(index) ? 'is-compared' : ''} ${animate && motion.has(index) ? 'is-moving' : ''} ${animate && changed.has(index) && !motion.has(index) ? 'is-changed' : ''}`} style={animate && motion.has(index) ? { '--move-from': `${motion.get(index)}px` } as React.CSSProperties : undefined} key={index}>
      <small>{index}</small><b>{String(item)}</b>
    </div>)}
    {value.length > 80 && <span className="muted">Showing 80 of {value.length}</span>}
    {!!event.focus.values?.length && <div className="focus-readout">Focus: {event.focus.values.map(pretty).join('  ·  ')}</div>}
  </div>;
}

function GraphView({ event, graph }: { event: TraceEvent; graph: Record<string, unknown> }) {
  const targetOf = (entry: unknown): string | undefined => {
    if (Array.isArray(entry)) return entry.length ? String(entry[0]) : undefined;
    if (entry && typeof entry === 'object') {
      const record = entry as Record<string, unknown>;
      const target = record.to ?? record.target ?? record.node ?? record.neighbor ?? record.vertex;
      return target === undefined ? undefined : String(target);
    }
    return String(entry);
  };
  const nodeNames = new Set(Object.keys(graph));
  for (const adjacency of Object.values(graph)) {
    if (Array.isArray(adjacency)) adjacency.forEach(entry => { const target = targetOf(entry); if (target !== undefined) nodeNames.add(target); });
    else if (adjacency && typeof adjacency === 'object') Object.keys(adjacency).forEach(target => nodeNames.add(target));
  }
  const nodes = Array.from(nodeNames).slice(0, 80);
  const width = 640, height = 340;
  const points = nodes.map((name, i) => {
    const angle = (2 * Math.PI * i / Math.max(nodes.length, 1)) - Math.PI / 2;
    return { name, x: width / 2 + Math.cos(angle) * Math.min(205, 90 + nodes.length * 9), y: height / 2 + Math.sin(angle) * Math.min(135, 60 + nodes.length * 6) };
  });
  const links = nodes.flatMap(from => {
    const adjacency = graph[from];
    const entries = Array.isArray(adjacency) ? adjacency : adjacency && typeof adjacency === 'object' ? Object.entries(adjacency as Record<string, unknown>).map(([to, weight]) => ({ to, weight })) : [];
    return entries.map(entry => {
      if (Array.isArray(entry)) return { from, to: targetOf(entry) ?? '', weight: entry.length > 1 ? entry[1] : undefined };
      if (entry && typeof entry === 'object') {
        const record = entry as Record<string, unknown>;
        const target = targetOf(record);
        return target === undefined ? undefined : { from, to: target, weight: record.weight ?? record.cost };
      }
      return { from, to: String(entry), weight: undefined };
    }).filter((link): link is { from: string; to: string; weight: unknown } => !!link);
  });
  const edgeKey = (from: string, to: string, weight: unknown) => JSON.stringify([from, to, weight ?? null]);
  const linkKeys = new Set(links.map(link => edgeKey(link.from, link.to, link.weight)));
  const hasReverse = (link: typeof links[number]) => linkKeys.has(edgeKey(link.to, link.from, link.weight));
  const undirected = links.length > 0 && links.every(hasReverse);
  const visibleLinks = undirected ? links.filter(link => link.from <= link.to) : links;
  const active = String(event.variables.node ?? event.variables.current ?? event.variables.vertex ?? '');
  const next = String(event.variables.neighbor ?? event.variables.next ?? event.variables.child ?? '');
  const collection = (names: string[]) => {
    const entry = Object.entries(event.variables).find(([name]) => names.includes(name.toLowerCase()))?.[1];
    if (Array.isArray(entry)) return new Set(entry.map(String));
    if (entry && typeof entry === 'object') return new Set(Object.keys(entry));
    return new Set<string>();
  };
  const visited = collection(['visited', 'seen', 'finished']);
  const discovered = collection(['discovered', 'frontier']);
  return <svg className="graph-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Graph structure and traversal state"><defs><marker id="edge-arrow" markerWidth="9" markerHeight="7" refX="7" refY="3.5" orient="auto"><polygon points="0 0, 8 3.5, 0 7" fill="#536176"/></marker><marker id="active-edge-arrow" markerWidth="9" markerHeight="7" refX="7" refY="3.5" orient="auto"><polygon points="0 0, 8 3.5, 0 7" fill="#d7f675"/></marker></defs>
    {visibleLinks.map((link, i) => {
      const from = points.find(point => point.name === link.from), to = points.find(point => point.name === link.to); if (!from || !to) return null;
      const focused = !!next && active === link.from && next === link.to;
      return <g key={`${link.from}-${link.to}-${i}`}><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} markerEnd={!undirected ? focused ? 'url(#active-edge-arrow)' : 'url(#edge-arrow)' : undefined} className={focused ? 'graph-edge active-edge' : 'graph-edge'} /><text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6} className="edge-label">{link.weight !== undefined ? String(link.weight) : ''}</text><title>{link.from}{undirected ? ' — ' : ' → '}{link.to}{link.weight !== undefined ? ` (${String(link.weight)})` : ''}</title></g>;
    })}
    {points.map(point => {
      const stateClass = point.name === active ? 'active-node' : visited.has(point.name) ? 'visited-node' : discovered.has(point.name) ? 'discovered-node' : '';
      const isYellow = stateClass === 'active-node';
      return (
        <g key={point.name}>
          <circle cx={point.x} cy={point.y} r="22" className={`graph-node ${stateClass}`} />
          <text
            x={point.x}
            y={point.y + 5}
            textAnchor="middle"
            className={`graph-node-label ${isYellow ? 'active-node-label' : ''}`}
            style={{ fill: isYellow ? '#000000' : '#edf3e3' }}
          >
            {point.name}
          </text>
        </g>
      );
    })}
  </svg>;
}

function StackQueueView({ event, values, structure }: { event: TraceEvent; values: unknown[]; structure: string }) {
  const isStack = structure === 'stack';
  const isDeque = structure === 'deque';
  const operation = event.operation;
  const fromLeft = operation.endsWith('-left') || event.focus.direction === 'left';
  const mutatingEndOperation = /^(enqueue|dequeue)(-(left|right))?$/.test(operation);
  const activeIndex = values.length ? fromLeft ? 0 : values.length - 1 : -1;
  const mutatingDequeOperation = isDeque && /^(enqueue|dequeue)-(left|right)$/.test(operation);
  const occurrences = new Map<string, number>();
  const itemKeys = values.map(value => { const token = JSON.stringify(value) ?? String(value); const index = occurrences.get(token) || 0; occurrences.set(token, index + 1); return `${token}-${index}`; });
  return <div className={isStack ? 'stack-view' : isDeque ? 'deque-view' : 'queue-view'}>
    {isStack && <div className="top-pointer">TOP ↓</div>}
    {!isStack && <div className="queue-pointers"><span className={mutatingEndOperation && fromLeft ? 'active-end' : ''}>{fromLeft ? '← FRONT' : 'FRONT'}</span><span className={mutatingEndOperation && !fromLeft ? 'active-end' : ''}>{fromLeft ? 'REAR' : 'REAR →'}</span></div>}
    <div className={isStack ? 'stack-items' : 'queue-items'}>{values.map((v, i) => <div className={`structure-item ${!isStack && (i === 0 || i === values.length - 1) ? 'endpoint' : ''} ${mutatingEndOperation && i === activeIndex ? 'deque-active-end' : ''} ${operation.endsWith('left') && operation.startsWith('enqueue') && i === 0 ? 'deque-arrive-left' : ''} ${operation.endsWith('right') && operation.startsWith('enqueue') && i === values.length - 1 ? 'deque-arrive-right' : ''}`} key={itemKeys[i]}>{structureItemLabel(v)}</div>)}</div>
    {isDeque && <small className="deque-caption">{operation.startsWith('enqueue') ? 'Inserted at' : operation.startsWith('dequeue') ? 'Removed from' : 'Double-ended queue'} {mutatingDequeOperation ? fromLeft ? 'front' : 'rear' : ''}</small>}
    {!values.length && <span className="muted">Empty {structure}</span>}
  </div>;
}

function StringView({ event, name, value, state, animate }: { event: TraceEvent; name: string; value: string; state?: Record<string, unknown>; animate: boolean }) {
  const activeIndices = new Set(event.focus.indices || []);
  const comparing = event.eventType === 'compare' || event.operation === 'compare';
  const currentState = state || event.afterState || event.state || {};

  // Track pointer movements (e.g. index, idx, i, j, start, left, right, position)
  const pointerNames = ['index', 'idx', 'i', 'j', 'start', 'left', 'right', 'position'];
  const pointerEntry = Object.entries(event.variables).find(([k, v]) => pointerNames.includes(k) && typeof v === 'number');
  const pointerIndex = pointerEntry ? (pointerEntry[1] as number) : (typeof currentState.index === 'number' ? (currentState.index as number) : undefined);

  // Track matched pattern
  const foundAt = typeof event.variables.found_at === 'number' ? (event.variables.found_at as number) : (typeof event.variables.found === 'number' ? (event.variables.found as number) : undefined);
  const isBranchTaken = event.focus.result === 'taken';
  const patternValue = typeof currentState.pattern === 'string' ? (currentState.pattern as string) : undefined;
  const patternLength = patternValue ? patternValue.length : (activeIndices.size > 0 ? activeIndices.size : 1);

  const isMatchFound = foundAt !== undefined || (comparing && isBranchTaken) || event.variables.is_palindrome === true;
  const matchStart = foundAt !== undefined ? foundAt : (isMatchFound && pointerIndex !== undefined ? pointerIndex : (event.focus.indices?.[0] ?? -1));
  const matchedIndices = new Set<number>();
  if (isMatchFound && matchStart >= 0) {
    for (let i = matchStart; i < matchStart + patternLength; i++) {
      matchedIndices.add(i);
    }
  }

  // Find secondary strings, e.g. pattern
  const secondaryString = Object.entries(currentState).find(([k, v]) => typeof v === 'string' && k !== name && !k.startsWith('__') && v.length > 0) as [string, string] | undefined;

  return (
    <div className="string-view" key={event.step}>
      <div className="string-tape-section">
        <span className="array-label">{name}</span>
        <div className={`string-cells ${comparing ? 'is-comparing' : ''}`}>
          {Array.from(value.slice(0, 120)).map((char, index) => {
            const isMatched = matchedIndices.has(index);
            const isCompared = activeIndices.has(index);
            const isPointer = pointerIndex === index;
            const stateClass = isMatched ? 'is-matched' : isCompared ? 'is-compared' : isPointer ? 'is-pointer' : '';
            return (
              <div className={`string-cell ${stateClass} ${animate && (isCompared || isMatched) ? 'is-animated' : ''}`} key={index}>
                {isPointer && <span className="string-pointer-badge">▲ {pointerEntry?.[0] || 'ptr'}</span>}
                <small>{index}</small>
                <b>{char === ' ' ? '␠' : char}</b>
              </div>
            );
          })}
        </div>
      </div>

      {secondaryString && (
        <div
          className="string-tape-section string-pattern-section"
          style={{
            marginLeft: pointerIndex !== undefined && pointerIndex >= 0 ? `${pointerIndex * 52}px` : undefined,
            transition: 'margin-left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <span className="array-label">{secondaryString[0]} {pointerIndex !== undefined ? `(aligned at index ${pointerIndex})` : ''}</span>
          <div className="string-cells string-pattern-row">
            {Array.from(secondaryString[1].slice(0, 120)).map((char, pIndex) => {
              const alignedTextIndex = (pointerIndex ?? 0) + pIndex;
              const isMatched = matchedIndices.has(alignedTextIndex);
              const isCompared = activeIndices.has(alignedTextIndex);
              return (
                <div className={`string-cell ${isMatched ? 'is-matched' : isCompared ? 'is-compared' : ''}`} key={pIndex}>
                  <small>{pIndex}</small>
                  <b>{char === ' ' ? '␠' : char}</b>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {value.length > 120 && <span className="muted">Showing first 120 characters</span>}
    </div>
  );
}

function LinkedListView({ event, root }: { event: TraceEvent; root: Record<string, unknown> }) {
  const chain: Array<Record<string, unknown>> = [];
  const seen = new Set<object>();
  let current: any = root;
  while (current && typeof current === 'object' && '__type__' in current && chain.length < 20 && !seen.has(current)) {
    seen.add(current); chain.push(current); current = current.next;
  }
  const nodeValue = (node: Record<string, unknown>) => String(node.value ?? node.val ?? node.data ?? '?');
  const pointerValues = (pointer: unknown) => {
    const result: string[] = [];
    const pointerSeen = new Set<object>();
    let node: any = pointer;
    while (node && typeof node === 'object' && '__type__' in node && result.length < 8 && !pointerSeen.has(node)) {
      pointerSeen.add(node); result.push(nodeValue(node)); node = node.next;
    }
    return result;
  };
  const locatePointer = (pointer: unknown) => {
    const pointerId = pointer && typeof pointer === 'object' ? (pointer as Record<string, unknown>).__id__ : undefined;
    if (typeof pointerId === 'string') return chain.findIndex(node => node.__id__ === pointerId);
    const path = pointerValues(pointer);
    if (path.length) return chain.findIndex((_, index) => path.every((value, offset) => chain[index + offset] && nodeValue(chain[index + offset]) === value));
    return chain.findIndex(node => nodeValue(node) === String(pointer));
  };
  const activeIndex = locatePointer(event.variables.current ?? event.variables.node);
  const declaredTail = locatePointer(event.variables.tail);
  const tailIndex = declaredTail >= 0 ? declaredTail : chain.length - 1;
  return <div className="linked-view">
    <span className="list-head">HEAD · {String(event.variables.head ? nodeValue(event.variables.head as Record<string, unknown>) : nodeValue(root))}</span>
    <div className="linked-row">{chain.map((node, i) => <React.Fragment key={i}><div className={`linked-node ${i === activeIndex ? 'active-linked-node' : ''} ${i === tailIndex ? 'tail-linked-node' : ''}`}><small>{String(node.__type__)}</small><b>{nodeValue(node)}</b>{'prev' in node ? <small>prev ↶</small> : null}{i === activeIndex && <span className="node-pointer">CURRENT</span>}</div>{i < chain.length - 1 && <span className={`next-pointer ${i === activeIndex ? 'active-pointer' : ''}`}>next →</span>}</React.Fragment>)}</div>
    {chain.length > 0 && <span className="list-tail">TAIL · {nodeValue(chain[tailIndex] || chain[chain.length - 1])}</span>}
    {!chain.length && <span className="muted">No linked nodes yet</span>}
    <small className="list-source">Current pointer: {activeIndex >= 0 ? `node ${activeIndex + 1}` : '—'}</small>
  </div>;
}

function TreeView({ event, root }: { event: TraceEvent; root: Record<string, unknown> }) {
  const nodes: Array<{ key: string; value: string; depth: number; position: number; parent?: string }> = [];
  const add = (node: any, path = '', parent?: string) => {
    if (!node || typeof node !== 'object' || !('__type__' in node) || nodes.length >= 63) return;
    const depth = path.length;
    const position = path ? parseInt(path.replaceAll('L', '0').replaceAll('R', '1'), 2) : 0;
    const key = path || 'root';
    nodes.push({ key, value: String(node.value ?? node.val ?? node.key ?? '?'), depth, position, parent });
    add(node.left, `${path}L`, key); add(node.right, `${path}R`, key);
  };
  add(root);
  const xFor = (node: typeof nodes[number]) => 620 * (node.position + 1) / (2 ** node.depth + 1);
  const yFor = (node: typeof nodes[number]) => 46 + node.depth * 82;
  const current = event.variables.current;
  const node = event.variables.node;
  const activeValue = (value: unknown) => value && typeof value === 'object' && 'value' in value ? (value as Record<string, unknown>).value : value;
  const active = String(activeValue(current) ?? activeValue(node) ?? '');
  return <svg className="tree-svg" viewBox="0 0 620 390" role="img" aria-label="Tree nodes and child links">
    {nodes.filter(node => node.parent).map(node => { const parent = nodes.find(candidate => candidate.key === node.parent)!; return <line key={`edge-${node.key}`} x1={xFor(parent)} y1={yFor(parent)} x2={xFor(node)} y2={yFor(node)} className="tree-edge"/>; })}
    {nodes.map(node => {
      const isActive = node.value === active;
      const isYellow = isActive;
      return (
        <g key={node.key}>
          <circle cx={xFor(node)} cy={yFor(node)} r="23" className={isActive ? 'tree-node active-node' : 'tree-node'}/>
          <text
            x={xFor(node)}
            y={yFor(node) + 5}
            textAnchor="middle"
            className={`tree-node-label ${isYellow ? 'active-node-label' : ''}`}
            style={{ fill: isYellow ? '#000000' : '#eff5e8' }}
          >
            {node.value}
          </text>
          <text x={xFor(node) - 34} y={yFor(node) + 4} textAnchor="end" className="tree-side-label">{node.depth === 0 ? 'root' : node.key.at(-1)?.toLowerCase()}</text>
        </g>
      );
    })}
    {!nodes.length && <text x="310" y="190" textAnchor="middle" className="tree-node-label">Tree is empty</text>}
  </svg>;
}

function HeapView({ event, name, values }: { event: TraceEvent; name: string; values: unknown[] }) {
  const width = 620, maxDepth = Math.min(5, Math.ceil(Math.log2(Math.max(values.length + 1, 2))));
  const point = (index: number) => { const depth = Math.floor(Math.log2(index + 1)); const first = 2 ** depth - 1; const position = index - first; return { x: width * (position + 1) / (2 ** depth + 1), y: 42 + depth * 67 }; };
  const focused = new Set(event.focus.indices || []);
  return <div className="heap-view">
    <svg className="heap-svg" viewBox={`0 0 ${width} ${maxDepth * 68 + 30}`} role="img" aria-label="Heap tree representation">{values.map((value, index) => {
      const p = point(index);
      const parentIndex = index ? Math.floor((index - 1) / 2) : -1;
      const parent = parentIndex >= 0 ? point(parentIndex) : undefined;
      const edgeActive = focused.has(index) && focused.has(parentIndex);
      const isActive = focused.has(index);
      return (
        <g key={index}>
          {parent && <line x1={parent.x} y1={parent.y} x2={p.x} y2={p.y} className={edgeActive ? 'tree-edge active-edge' : 'tree-edge'}/>}
          <circle cx={p.x} cy={p.y} r="20" className={isActive ? 'tree-node active-node' : 'tree-node'}/>
          <text
            x={p.x}
            y={p.y + 5}
            textAnchor="middle"
            className={`tree-node-label ${isActive ? 'active-node-label' : ''}`}
            style={{ fill: isActive ? '#000000' : '#eff5e8' }}
          >
            {String(value)}
          </text>
        </g>
      );
    })}</svg>
    <div className="heap-array"><span>{name}</span>{values.map((value, i) => <div className={`matrix-cell ${focused.has(i) ? 'is-focused' : ''}`} key={i}><small>{i}</small><b>{String(value)}</b></div>)}</div>
  </div>;
}

function MappingView({ value }: { value: Record<string, unknown> }) {
  const entries = Object.entries(value).filter(([key]) => !key.startsWith('__'));
  return <div className="mapping-view">{entries.map(([key, val]) => <div className="mapping-entry" key={key}><code>{key}</code><span>→</span><b>{pretty(val)}</b></div>)}{!entries.length && <span className="muted">Empty mapping</span>}</div>;
}

function UnionFindView({ event, state }: { event: TraceEvent; state: Record<string, unknown> }) {
  const parent = Object.entries(state).find(([name, value]) => /parent/i.test(name) && Array.isArray(value));
  if (!parent) {
    const mapping = Object.entries(state).find(([name, value]) => /parent/i.test(name) && !!value && typeof value === 'object' && !Array.isArray(value));
    return mapping ? <MappingView value={mapping[1] as Record<string, unknown>}/> : <StateSummaryView state={state}/>;
  }
  const active = new Set(event.focus.indices || []);
  return <div className="mapping-view union-find-view">{(parent[1] as unknown[]).map((root, index) => <div className={`mapping-entry ${active.has(index) ? 'is-focused' : ''}`} key={index}><code>{index}</code><span>→</span><b>{pretty(root)}</b></div>)}</div>;
}

function MathematicalView({ event, state }: { event: TraceEvent; state: Record<string, unknown> }) {
  const values = Object.entries(state).filter(([, value]) => typeof value === 'number' || typeof value === 'boolean');
  return <div className="mapping-view mathematical-view"><div className="mapping-entry"><code>Operation</code><b>{event.statement || event.operation}</b></div>{values.map(([name, value]) => <div className="mapping-entry" key={name}><code>{name}</code><b>{String(value)}</b></div>)}{!values.length && <span className="muted">No numeric values captured</span>}</div>;
}

function RangeQueryView({ event, state, array, tree, animate }: { event: TraceEvent; state: Record<string, unknown>; array?: [string, unknown[]]; tree?: [string, Record<string, unknown>]; animate: boolean }) {
  if (array && tree) return <div className="range-query-view"><ArrayView event={event} value={array[1]} name={array[0]} animate={animate}/><TreeView event={event} root={tree[1]}/></div>;
  if (array) return <ArrayView event={event} value={array[1]} name={array[0]} animate={animate}/>;
  if (tree) return <TreeView event={event} root={tree[1]}/>;
  return <StateSummaryView state={state}/>;
}

function AuxiliaryStructures({ event, source }: { event?: TraceEvent; source: string }) {
  if (!event || ['stack', 'queue', 'deque'].includes(resolveVisualizerRoute(event.dataStructure))) return null;
  const state = event.afterState || event.state;
  const appended = new Set(Array.from(source.matchAll(/\b([A-Za-z_]\w*)\s*\.\s*(?:append|push)\s*\(/g), match => match[1]));
  const popped = new Set(Array.from(source.matchAll(/\b([A-Za-z_]\w*)\s*\.\s*pop\s*\(/g), match => match[1]));
  const leftRemoved = new Set(Array.from(source.matchAll(/\b([A-Za-z_]\w*)\s*\.\s*(?:popleft|get)\s*\(/g), match => match[1]));
  const dequeNames = new Set(Array.from(source.matchAll(/\b([A-Za-z_]\w*)\s*=\s*(?:collections\.)?deque\s*\(/g), match => match[1]));
  const names = new Set([...appended].filter(name => Array.isArray(state[name]) && (popped.has(name) || leftRemoved.has(name) || dequeNames.has(name))));
  const auxiliary = [...names].filter(name => {
    if (dequeNames.has(name) || leftRemoved.has(name) || (popped.has(name) && /\.\s*pop\s*\(\s*0\s*\)/.test(source))) return true;
    return popped.has(name);
  });
  if (!auxiliary.length) return null;
  return <section className="bottom-section auxiliary-structures"><span className="eyebrow">SUPPORTING STRUCTURES</span>{auxiliary.map(name => {
    const structure = dequeNames.has(name) || leftRemoved.has(name) || /\.\s*pop\s*\(\s*0\s*\)/.test(source) ? 'queue' : 'stack';
    return <div className="auxiliary-structure" key={name}><span className="array-label">{name}</span><StackQueueView event={event} values={state[name] as unknown[]} structure={structure}/></div>;
  })}</section>;
}

function StateSummaryView({ state }: { state: Record<string, unknown> }) {
  const entries = Object.entries(state).filter(([name]) => !name.startsWith('__'));
  return <div className="mapping-view state-view">
    {entries.map(([name, value]) => <div className="mapping-entry" key={name}><code>{name}</code><span>:</span><b>{pretty(value)}</b></div>)}
    {!entries.length && <span className="muted">No state values captured</span>}
  </div>;
}

function BitwiseView({ state }: { state: Record<string, unknown> }) {
  const registers = Object.entries(state).filter(([, value]) => typeof value === 'number' && Number.isInteger(value));
  return <div className="mapping-view bitwise-view">
    {registers.map(([name, value]) => <div className="mapping-entry" key={name}><code>{name}</code><span>=</span><b>{String(value)}</b><code>{(value as number).toString(2)}</code></div>)}
    {!registers.length && <StateSummaryView state={state}/ >}
  </div>;
}

function GeometryView({ state }: { state: Record<string, unknown> }) {
  const entry = Object.entries(state).find(([name, value]) => /point|coordinate/i.test(name) && Array.isArray(value) && value.every(point => Array.isArray(point) && point.length >= 2 && point.slice(0, 2).every(Number.isFinite)))
    || Object.entries(state).find(([, value]) => Array.isArray(value) && value.length > 0 && value.every(point => Array.isArray(point) && point.length >= 2 && point.slice(0, 2).every(Number.isFinite)));
  if (!entry) return <StateSummaryView state={state}/>;
  const [name, rawPoints] = entry;
  const points = rawPoints as number[][];
  const xs = points.map(point => point[0]);
  const ys = points.map(point => point[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const x = (value: number) => 40 + (value - minX) / (maxX - minX || 1) * 540;
  const y = (value: number) => 280 - (value - minY) / (maxY - minY || 1) * 240;
  return <svg className="graph-svg geometry-svg" viewBox="0 0 620 320" role="img" aria-label={`${name} coordinate plot`}>
    <line x1="40" y1="280" x2="590" y2="280" className="graph-edge"/><line x1="40" y1="280" x2="40" y2="30" className="graph-edge"/>
    {points.length > 2 && <polyline points={points.map(point => `${x(point[0])},${y(point[1])}`).join(' ')} fill="none" className="graph-edge"/>}
    {points.map((point, index) => <g key={index}><circle cx={x(point[0])} cy={y(point[1])} r="7" className="graph-node"/><text x={x(point[0]) + 9} y={y(point[1]) - 8} className="graph-node-label">({point[0]}, {point[1]})</text></g>)}
  </svg>;
}

function RecursionView({ event }: { event: TraceEvent }) {
  return <div className="recursion-view call-stack">
    {event.callStack.map((frame, index) => <div className={`call-frame ${index === event.callStack.length - 1 ? 'active-frame' : ''}`} key={`${frame.name}-${index}`}><b>{frame.name}()</b><span>line {frame.line}</span><small>{Object.entries(frame.arguments).map(([name, value]) => `${name}=${pretty(value)}`).join(', ')}</small></div>)}
    {!event.callStack.length && <span className="muted">No active recursive calls</span>}
  </div>;
}

type VisualErrorBoundaryProps = { children: React.ReactNode };
type VisualErrorBoundaryState = { failed: boolean };

class VisualErrorBoundary extends React.Component<VisualErrorBoundaryProps, VisualErrorBoundaryState> {
  state: VisualErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): VisualErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error('Visualization render failed', error);
  }

  render() {
    if (this.state.failed) return <div className="error visual-error" role="alert"><AlertCircle/> This step could not be visualized.</div>;
    return this.props.children;
  }
}

function GenericDebuggerView({ event, state }: { event: TraceEvent; state: Record<string, unknown> }) {
  const locals = Object.entries(event.variables || {}).filter(([k]) => !k.startsWith('__'));
  const globals = Object.entries(event.globals || {}).filter(([k]) => !k.startsWith('__') && !k.startsWith('_'));
  const beforeState = event.beforeState || {};
  const changedVars = new Set(
    Object.keys(state).filter(k => JSON.stringify(beforeState[k]) !== JSON.stringify(state[k]))
  );

  const getType = (val: unknown): string => {
    if (val === null) return 'None';
    if (val === undefined) return 'undefined';
    if (Array.isArray(val)) return `list[${val.length}]`;
    if (typeof val === 'object') {
      const rec = val as Record<string, unknown>;
      if (rec.__type__) return String(rec.__type__);
      return `dict[${Object.keys(rec).length}]`;
    }
    return typeof val;
  };

  const renderVarCard = (name: string, val: unknown) => {
    const isChanged = changedVars.has(name);
    const typeStr = getType(val);
    return (
      <div key={name} className={`debugger-var-card ${isChanged ? 'is-changed' : ''}`}>
        <div className="debugger-var-header">
          <code className="debugger-var-name">{name}</code>
          <span className="debugger-var-type">{typeStr}</span>
        </div>
        <div className="debugger-var-value" title={pretty(val)}>
          {pretty(val)}
        </div>
      </div>
    );
  };

  return (
    <div className="generic-debugger-view" aria-label="Debugger memory inspector">
      <div className="debugger-section">
        <div className="debugger-section-title">
          <span>LOCAL VARIABLES</span>
          <span className="debugger-scope-badge">{event.function || '<module>'}()</span>
        </div>
        {locals.length ? (
          <div className="debugger-grid">
            {locals.map(([k, v]) => renderVarCard(k, v))}
          </div>
        ) : (
          <p className="debugger-empty">No local variables in current scope</p>
        )}
      </div>

      {globals.length > 0 && (
        <div className="debugger-section globals-section">
          <div className="debugger-section-title">
            <span>GLOBAL SCOPE</span>
            <span className="debugger-scope-badge">module</span>
          </div>
          <div className="debugger-grid">
            {globals.map(([k, v]) => renderVarCard(k, v))}
          </div>
        </div>
      )}
    </div>
  );
}

function Visual({ event, animate, source }: { event?: TraceEvent; animate: boolean; source: string }) {
  if (!event) return <div className="empty">Run your Python code to record its execution.</div>;
  if (event.eventType === 'error') {
    return (
      <div className="error visual-error visual-error-banner" role="alert">
        <AlertCircle size={28} className="error-icon" />
        <div className="error-content">
          <h4>Execution Error</h4>
          <p className="error-message">{event.explanation || event.message || 'An error occurred during execution'}</p>
          {event.line > 0 && <span className="error-line-badge">Line {event.line}: {event.statement}</span>}
        </div>
      </div>
    );
  }
  const route = resolveVisualizerRoute(event.dataStructure);
  const state = event.afterState || event.state;
  const annotatedName = source.match(/@visualize\s+[\w-]+\s+(\w+)/i)?.[1];
  const annotatedValue = annotatedName ? state[annotatedName] : undefined;
  const array = findArray(state, event.dataStructure, source);
  const stringValue = findString(state);
  const linked = annotatedValue && typeof annotatedValue === 'object' && !Array.isArray(annotatedValue) ? [annotatedName!, annotatedValue as Record<string, unknown>] as [string, Record<string, unknown>] : findObject(state, 'next') || (event.structure === 'linked-list' ? findObject(state, 'value') || findTypedObject(state) : undefined);
  const tree = annotatedValue && typeof annotatedValue === 'object' && !Array.isArray(annotatedValue) ? [annotatedName!, annotatedValue as Record<string, unknown>] as [string, Record<string, unknown>] : findObject(state, 'left') || findObject(state, 'right') || findObject(state, 'value') || (event.structure === 'tree' ? findTypedObject(state) : undefined);
  const trie = annotatedValue && typeof annotatedValue === 'object' && !Array.isArray(annotatedValue) ? [annotatedName!, annotatedValue as Record<string, unknown>] as [string, Record<string, unknown>] : findObject(state, 'children') || (event.structure === 'trie' ? findTypedObject(state) : undefined);
  const graphEntry = annotatedValue && typeof annotatedValue === 'object' && !Array.isArray(annotatedValue) ? [annotatedName!, annotatedValue as Record<string, unknown>] as [string, Record<string, unknown>] : Object.entries(state).find(([name, value]) => /^(graph|network|adj|adjacency)$/i.test(name) && !!value && typeof value === 'object' && !Array.isArray(value));
  const hashEntry = Object.entries(state).find(([name, value]) => /hash|table|map|count|freq/i.test(name) && !!value && typeof value === 'object' && !Array.isArray(value));
  const hashValue = hashEntry?.[1] as Record<string, unknown> | undefined;
  const routes: Record<VisualizerRoute, () => React.ReactNode> = {
    graph: () => graphEntry ? <GraphView event={event} graph={graphEntry[1] as Record<string, unknown>}/> : <StateSummaryView state={state}/>,
    'linked-list': () => linked ? <LinkedListView event={event} root={linked[1]}/> : <StateSummaryView state={state}/>,
    tree: () => tree ? <TreeView event={event} root={tree[1]}/> : <StateSummaryView state={state}/>,
    trie: () => trie ? <MappingView value={(trie[1].children || trie[1]) as Record<string, unknown>}/> : <StateSummaryView state={state}/>,
    heap: () => array ? <HeapView event={event} name={array[0]} values={array[1]}/> : <StateSummaryView state={state}/>,
    stack: () => array ? <StackQueueView event={event} values={array[1]} structure="stack"/> : <StateSummaryView state={state}/>,
    queue: () => array ? <StackQueueView event={event} values={array[1]} structure="queue"/> : <StateSummaryView state={state}/>,
    deque: () => array ? <StackQueueView event={event} values={array[1]} structure="deque"/> : <StateSummaryView state={state}/>,
    array: () => array ? <ArrayView event={event} value={array[1]} name={array[0]} animate={animate}/> : <StateSummaryView state={state}/>,
    'dynamic-programming': () => array ? <ArrayView event={event} value={array[1]} name={array[0]} animate={animate}/> : <StateSummaryView state={state}/>,
    'range-query': () => <RangeQueryView event={event} state={state} array={array} tree={tree} animate={animate}/>,
    string: () => stringValue ? <StringView event={event} name={stringValue[0]} value={stringValue[1]} state={state} animate={animate}/> : <StateSummaryView state={state}/>,
    'hash-table': () => hashValue ? <MappingView value={hashValue}/> : array ? <ArrayView event={event} value={array[1]} name={array[0]} animate={animate}/> : <StateSummaryView state={state}/>,
    'union-find': () => <UnionFindView event={event} state={state}/>,
    recursion: () => <RecursionView event={event}/>,
    bitwise: () => <BitwiseView state={state}/>,
    geometry: () => <GeometryView state={state}/>,
    mathematical: () => <MathematicalView event={event} state={state}/>,
    variables: () => <GenericDebuggerView event={event} state={state}/>,
    generic: () => <GenericDebuggerView event={event} state={state}/>,
  };
  return routes[route]();
}

function App() {
  const [tab, setTab] = useState<'editor' | 'algorithms' | 'sandbox' | 'tweaker'>('editor');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmData | null>(null);
  const [showEdgeModal, setShowEdgeModal] = useState(false);
  const [code, setCode] = useState(initial);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [sample, setSample] = useState('Binary search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(true);
  const [showStates, setShowStates] = useState(false);
  const codeEditor = useRef<any>(null);
  const decorations = useRef<string[]>([]);
  const event = events[index];
  const variables = event?.variables || {};

  // Deep linking and browser history / hash sync
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const match = hash.match(/#\/?algorithms\/([a-z0-9-]+)/i);
      if (match) {
        const found = allAlgorithms.find((a) => a.id === match[1]);
        if (found) {
          setSelectedAlgorithm(found);
          setTab('algorithms');
        }
      } else if (!hash || hash === '#') {
        setSelectedAlgorithm(null);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('popstate', handleHash);
    };
  }, []);

  useEffect(() => {
    if (!running || events.length < 1) return;
    const timer = window.setTimeout(() => {
      if (index >= events.length - 1) {
        setRunning(false);
      } else {
        const nextIndex = index + 1;
        if (events[nextIndex]?.eventType === 'error') {
          setRunning(false);
        }
        setIndex(nextIndex);
      }
    }, speed);
    return () => window.clearTimeout(timer);
  }, [running, index, events, speed]);

  useEffect(() => {
    if (event?.eventType === 'error' && running) {
      setRunning(false);
    }
  }, [event?.eventType, running]);

  useEffect(() => {
    const editor = codeEditor.current;
    if (!editor || !event?.line) return;
    decorations.current = editor.deltaDecorations(decorations.current, [{
      range: new (window as any).monaco.Range(event.line, 1, event.line, 1),
      options: { isWholeLine: true, className: 'current-code-line', linesDecorationsClassName: 'code-line-marker' },
    }]);
    editor.revealLineInCenterIfOutsideViewport(event.line);
  }, [event?.line]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.monaco-editor') || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); setRunning(false); setIndex(i => Math.max(0, i - 1)); }
      if (e.key === 'ArrowRight' && events.length) { e.preventDefault(); setRunning(false); setIndex(i => Math.min(events.length - 1, i + 1)); }
      if (e.key === ' ' && events.length) { e.preventDefault(); setRunning(r => !r); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [events.length]);

  const run = async () => {
    setRunning(false); setLoading(true); setError('');
    try { const result = await tracePython(code); setEvents(result); setIndex(0); }
    catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setLoading(false); }
  };

  const progress = events.length > 1 ? index / (events.length - 1) * 100 : events.length ? 100 : 0;
  const beforeText = useMemo(() => event ? JSON.stringify(event.beforeState, null, 2) : '', [event]);
  const afterText = useMemo(() => event ? JSON.stringify(event.afterState, null, 2) : '', [event]);

  const matchMessage = useMemo(() => {
    if (!event) return null;
    const currentState = (event.afterState || event.state || {}) as Record<string, unknown>;
    const foundAt = typeof event.variables?.found_at === 'number'
      ? (event.variables.found_at as number)
      : (typeof event.variables?.found === 'number' ? (event.variables.found as number) : undefined);
    const comparing = event.eventType === 'compare' || event.operation === 'compare';
    const isBranchTaken = event.focus?.result === 'taken';
    const pointerNames = ['index', 'idx', 'i', 'j', 'start', 'left', 'right', 'position'];
    const pointerEntry = Object.entries(event.variables || {}).find(([k, v]) => pointerNames.includes(k) && typeof v === 'number');
    const pointerIndex = pointerEntry ? (pointerEntry[1] as number) : (typeof currentState.index === 'number' ? (currentState.index as number) : undefined);
    const isMatchFound = foundAt !== undefined || (comparing && isBranchTaken && event.structure === 'string') || event.variables?.is_palindrome === true;
    const matchStart = foundAt !== undefined ? foundAt : (isMatchFound && pointerIndex !== undefined ? pointerIndex : (event.focus?.indices?.[0] ?? -1));
    if (isMatchFound && matchStart >= 0) {
      return `Pattern matched at index ${matchStart}`;
    }
    return null;
  }, [event]);

  return <div className="app">
    <header>
      <div className="brand">
        <div className="logo">CN</div>
        <div>
          <h1>ChronoNode</h1>
          <span>Python DSA visualizer</span>
        </div>
      </div>
      <div className="header-actions">
        <button
          className={`ghost ${tab === 'algorithms' && !selectedAlgorithm ? 'active-header-btn' : ''}`}
          onClick={() => {
            setSelectedAlgorithm(null);
            setTab('algorithms');
            if (window.location.hash.includes('algorithms/')) {
              window.location.hash = '';
            }
          }}
          aria-label="Learning resources"
        >
          <BookOpen size={16}/> Learn
        </button>
        <button
          className={`ghost ${tab === 'editor' && !selectedAlgorithm ? 'active-header-btn' : ''}`}
          onClick={() => {
            setSelectedAlgorithm(null);
            setTab('editor');
            if (window.location.hash.includes('algorithms/')) {
              window.location.hash = '';
            }
          }}
          aria-label="Python playground"
        >
          <Code2 size={16}/> Playground
        </button>
        <button
          className={`ghost ${tab === 'sandbox' && !selectedAlgorithm ? 'active-header-btn' : ''}`}
          onClick={() => {
            setSelectedAlgorithm(null);
            setTab('sandbox');
            if (window.location.hash.includes('algorithms/')) {
              window.location.hash = '';
            }
          }}
          aria-label="Interactive Sandbox visual builder"
        >
          <Layers size={16}/> Sandbox
        </button>
        <button
          className={`ghost ${tab === 'tweaker' && !selectedAlgorithm ? 'active-header-btn' : ''}`}
          onClick={() => {
            setSelectedAlgorithm(null);
            setTab('tweaker');
            if (window.location.hash.includes('algorithms/')) {
              window.location.hash = '';
            }
          }}
          aria-label="Live variable tweaker state machine"
        >
          <Sliders size={16}/> Live Tweaker
        </button>
      </div>
    </header>

    {selectedAlgorithm ? (
      <AlgorithmDetailPage
        algorithm={selectedAlgorithm}
        onBack={() => {
          setSelectedAlgorithm(null);
          if (window.location.hash.includes('algorithms/')) {
            window.location.hash = '';
          }
        }}
        onLoadIntoWorkspace={(newCode) => {
          setCode(newCode);
          setEvents([]);
          setIndex(0);
          setRunning(false);
          setSelectedAlgorithm(null);
          setTab('editor');
          window.location.hash = '';
        }}
      />
    ) : (
      <main>
        <aside className="sidebar">
          <div className="side-title">WORKSPACE</div>
          <button className={`nav ${tab === 'editor' ? 'active' : ''}`} onClick={() => setTab('editor')}><Code2/> Editor</button>
          <button className={`nav ${tab === 'algorithms' ? 'active' : ''}`} onClick={() => setTab('algorithms')}><GitBranch/> Algorithms</button>
          <button className={`nav ${tab === 'sandbox' ? 'active' : ''}`} onClick={() => setTab('sandbox')}><Layers/> Sandbox Mode</button>
          <button className={`nav ${tab === 'tweaker' ? 'active' : ''}`} onClick={() => setTab('tweaker')}><Sliders/> Live Tweaker</button>
          <div className="side-title samples">SAMPLES</div>
          {Object.keys(samples).map(name => (
            <button
              className={`sample ${sample === name && tab === 'editor' ? 'selected' : ''}`}
              onClick={() => {
                setTab('editor');
                setSample(name);
                setCode(samples[name]);
                setEvents([]);
                setIndex(0);
              }}
              key={name}
            >
              {name}
            </button>
          ))}
        </aside>
        {tab === 'algorithms' ? (
          <AlgorithmsPanel
            onSelectAlgorithm={(algo) => {
              setSelectedAlgorithm(algo);
              window.location.hash = `#/algorithms/${algo.id}`;
            }}
            onLoadCode={(newCode) => {
              setCode(newCode);
              setEvents([]);
              setIndex(0);
              setRunning(false);
              setTab('editor');
            }}
          />
        ) : tab === 'sandbox' ? (
          <SandboxMode
            onLoadIntoWorkspace={(newCode) => {
              setCode(newCode);
              setSample('Custom Sandbox');
              setEvents([]);
              setIndex(0);
              setRunning(false);
              setTab('editor');
            }}
          />
        ) : tab === 'tweaker' ? (
          <LiveVariableTweaker />
        ) : (
          <section className="workspace">
            <div className="toolbar">
              <label className="sample-select-label" htmlFor="sample-select">Example</label>
              <select id="sample-select" value={sample} onChange={e => { setSample(e.target.value); setCode(samples[e.target.value]); setEvents([]); setIndex(0); }}>{Object.keys(samples).map(name => <option key={name}>{name}</option>)}</select>
              <button
                className="edge-cases-btn"
                onClick={() => setShowEdgeModal(true)}
                title="Load adversarial edge-case datasets"
              >
                <Sparkles size={14}/> Edge Cases
              </button>
              <div className="run-controls"><button disabled={!events.length} onClick={() => { setRunning(false); setIndex(0); }} title="Restart replay" aria-label="Restart replay"><RotateCcw size={16}/></button><button disabled={!events.length || index === 0} onClick={() => { setRunning(false); setIndex(i => Math.max(0, i - 1)); }} title="Previous step" aria-label="Previous step"><ChevronLeft size={18}/></button><button className="run" disabled={loading} onClick={() => events.length ? setRunning(value => !value) : run()}>{loading ? <span className="spinner"/> : running ? <Pause size={15}/> : <Play size={15}/>} {loading ? 'Tracing…' : events.length ? running ? 'Pause' : 'Resume' : 'Run code'}</button><button disabled={!events.length || index >= events.length - 1} onClick={() => { setRunning(false); setIndex(i => Math.min(events.length - 1, i + 1)); }} title="Next step" aria-label="Next step"><ChevronRight size={18}/></button><button disabled={!events.length || index >= events.length - 1} onClick={() => { setRunning(false); setIndex(events.length - 1); }} title="Jump to last step" aria-label="Jump to last step"><SkipForward size={16}/></button></div>
              <label className="speed-control">Speed <input aria-label="Playback speed" type="range" min="80" max="1200" step="40" value={1200 - speed} onChange={e => setSpeed(1200 - Number(e.target.value))}/></label>
            </div>
            <div className="panes"><div className="editor-pane"><div className="pane-head"><span>main.py</span><span className="python">PYTHON</span></div><Editor height="100%" language="python" theme="vs-dark" value={code} onChange={value => { setCode(value || ''); setEvents([]); setIndex(0); setRunning(false); }} onMount={editor => { codeEditor.current = editor; }} options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, automaticLayout: true, glyphMargin: true, ariaLabel: 'Python source code editor' }}/></div>
              <div className="visual-pane"><div className="visual-head"><div><span className="eyebrow">EXECUTION VISUALIZATION</span><h2>{event?.structure || 'Ready to trace'}</h2></div><span className="step">{events.length ? `Step ${index + 1} / ${events.length}` : 'No trace yet'}</span></div>
                <div className="visual-canvas-container">
                  <PanZoomCanvas><VisualErrorBoundary key={event?.step ?? 0}><Visual event={event} animate={animate} source={code}/></VisualErrorBoundary></PanZoomCanvas>
                  <ComplexityOdometer events={events} currentIndex={index} />
                </div>
                <div className="legend" aria-label="Visualization legend"><span><i className="legend-compare"/>Comparison</span><span><i className="legend-change"/>Changed value</span><span><i className="legend-pointer"/>Current pointer</span></div>
                <div className="timeline" aria-label="Execution timeline"><div className="progress" style={{ width: `${progress}%` }}/><input aria-label="Jump to execution step" className="timeline-range" type="range" min="0" max={Math.max(0, events.length - 1)} value={index} disabled={!events.length} onChange={e => { setRunning(false); setIndex(Number(e.target.value)); }}/><div className="timeline-labels"><span>{events.length ? `#${index + 1} · line ${event?.line || '—'}` : 'Run to create steps'}</span><span>{events.length ? `${events.length} events` : '← → keys step · Space plays'}</span></div></div>
                <div className="explain"><span className="event-chip">{matchMessage ? 'MATCH' : (event?.eventType || 'READY')}</span><div className="event-description"><b>{matchMessage ? `✓ ${matchMessage} · ${event?.explanation || ''}` : (event?.explanation || 'Run your Python code to record its actual operations')}</b><small>{event?.statement || 'The source line and exact state will appear here.'}</small></div></div>
              </div>
            </div>
            <div className="bottom">
              <AuxiliaryStructures event={event} source={code}/>
              <section className="bottom-section"><div className="section-heading"><span className="eyebrow">VARIABLES · {event?.function || '—'}()</span>{event && <span className="depth-pill">depth {event.depth}</span>}</div>{Object.keys(variables).length ? <div className="vars">{Object.entries(variables).map(([key, value]) => <div className="var" key={key}><code>{key}</code><span title={pretty(value)}>{pretty(value)}</span></div>)}</div> : <p className="muted">Variables at this execution point will appear here.</p>}</section>
              <section className="bottom-section call-stack-section"><span className="eyebrow">CALL STACK</span>{event?.callStack.length ? <div className="call-stack">{event.callStack.map((frame, i) => <div className={`call-frame ${i === event.callStack.length - 1 ? 'active-frame' : ''}`} key={`${frame.name}-${i}`}><b>{frame.name}()</b><span>line {frame.line}</span><small>{Object.entries(frame.arguments).map(([k, v]) => `${k}=${pretty(v)}`).join(', ')}</small></div>)}</div> : <p className="muted">No active function calls at this step.</p>}</section>
              <section className="bottom-section event-meta"><span className="eyebrow">SOURCE & OPERATION</span><p className="source-statement"><code>{event?.line ? `${event.line}: ` : ''}{event?.statement || 'Waiting for execution'}</code></p><p className="muted">{event?.operation || '—'}{event?.returnValue !== undefined ? ` · returns ${pretty(event.returnValue)}` : ''}{event?.focus.result ? ` · branch ${event.focus.result}` : ''}{matchMessage ? ` · ✓ ${matchMessage}` : ''}</p>{matchMessage && <div className="operation-status-badge" aria-label="Operation status">✓ {matchMessage}</div>}{event?.lineComplexity && <div className="line-complexity" aria-label="Time and space cost for this step"><span>Time <b>{event.lineComplexity.time && event.lineComplexity.time !== 'O(?)' && event.lineComplexity.time !== '?' ? event.lineComplexity.time : 'O(1)'}</b> · {event.lineComplexity.timeDetails && !event.lineComplexity.timeDetails.includes('not covered') && !event.lineComplexity.timeDetails.includes('O(?)') ? event.lineComplexity.timeDetails : 'Scalar operation'}</span><br/><span>Space <b>{event.lineComplexity.space && event.lineComplexity.space !== 'O(?)' && event.lineComplexity.space !== '?' ? event.lineComplexity.space : 'O(1)'}</b> · {event.lineComplexity.spaceDetails && !event.lineComplexity.spaceDetails.includes('not covered') && !event.lineComplexity.spaceDetails.includes('O(?)') ? event.lineComplexity.spaceDetails : 'No additional auxiliary elements'}</span></div>}{event?.output && <pre className="event-output">{event.output}</pre>}<label className="toggle"><input type="checkbox" checked={animate} onChange={e => setAnimate(e.target.checked)}/> Animate changed values</label><button className="states-toggle" onClick={() => setShowStates(open => !open)}>{showStates ? 'Hide' : 'Inspect'} before / after state</button></section>
            </div>
            {showStates && event && <div className="state-comparison"><div><span className="eyebrow">BEFORE THIS EVENT</span><pre>{beforeText}</pre></div><div><span className="eyebrow">AFTER THIS EVENT</span><pre>{afterText}</pre></div></div>}
            {error && <div className="toast error"><AlertCircle size={18}/>{error}</div>}
          </section>
        )}
        <EdgeCaseModal
          isOpen={showEdgeModal}
          onClose={() => setShowEdgeModal(false)}
          onSelectDataset={(newCode, name) => {
            setCode(newCode);
            setSample(name);
            setEvents([]);
            setIndex(0);
            setRunning(false);
          }}
        />
      </main>
    )}
  </div>;
}

createRoot(document.getElementById('root')!).render(<App/>);
