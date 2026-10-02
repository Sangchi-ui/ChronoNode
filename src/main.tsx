import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Editor from '@monaco-editor/react';
import { AlertCircle, BookOpen, ChevronLeft, ChevronRight, Code2, GitBranch, Layers, Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { tracePython, type TraceEvent } from './trace';
import './styles.css';
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
const pretty = (value: unknown) => typeof value === 'string' ? value : JSON.stringify(value);

function findArray(state: Record<string, unknown>, structure: string): [string, unknown[]] | undefined {
  const entries = Object.entries(state);
  const named = entries.find(([name, value]) => Array.isArray(value) && (name === 'values' || name === 'arr' || name === 'array' || name === 'data' || name === 'cost' || name === 'dp'));
  const any = named || entries.find(([, value]) => Array.isArray(value));
  if (!any || structure === 'graph') return undefined;
  return [any[0], any[1] as unknown[]];
}

function findString(state: Record<string, unknown>): [string, string] | undefined {
  return Object.entries(state).find(([name, value]) => typeof value === 'string' && value.length > 1 && name !== '__name__') as [string, string] | undefined;
}

function findObject(state: Record<string, unknown>, field: string): [string, Record<string, unknown>] | undefined {
  return Object.entries(state).find(([, value]) => !!value && typeof value === 'object' && !Array.isArray(value) && field in value) as [string, Record<string, unknown>] | undefined;
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
    {points.map(point => { const stateClass = point.name === active ? 'active-node' : visited.has(point.name) ? 'visited-node' : discovered.has(point.name) ? 'discovered-node' : ''; return <g key={point.name}><circle cx={point.x} cy={point.y} r="22" className={`graph-node ${stateClass}`} /><text x={point.x} y={point.y + 5} textAnchor="middle" className="graph-node-label">{point.name}</text></g>; })}
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
    <div className={isStack ? 'stack-items' : 'queue-items'}>{values.map((v, i) => <div className={`structure-item ${!isStack && (i === 0 || i === values.length - 1) ? 'endpoint' : ''} ${mutatingEndOperation && i === activeIndex ? 'deque-active-end' : ''} ${operation.endsWith('left') && operation.startsWith('enqueue') && i === 0 ? 'deque-arrive-left' : ''} ${operation.endsWith('right') && operation.startsWith('enqueue') && i === values.length - 1 ? 'deque-arrive-right' : ''}`} key={itemKeys[i]}>{String(v)}</div>)}</div>
    {isDeque && <small className="deque-caption">{operation.startsWith('enqueue') ? 'Inserted at' : operation.startsWith('dequeue') ? 'Removed from' : 'Double-ended queue'} {mutatingDequeOperation ? fromLeft ? 'front' : 'rear' : ''}</small>}
    {!values.length && <span className="muted">Empty {structure}</span>}
  </div>;
}

function StringView({ event, name, value }: { event: TraceEvent; name: string; value: string }) {
  const active = new Set(event.focus.indices || []);
  return <div className="string-view"><span className="array-label">{name}</span><div className="string-cells">{Array.from(value.slice(0, 120)).map((char, index) => <div className={`string-cell ${active.has(index) ? 'is-compared' : ''}`} key={index}><small>{index}</small><b>{char === ' ' ? '␠' : char}</b></div>)}</div>{value.length > 120 && <span className="muted">Showing first 120 characters</span>}</div>;
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
    {nodes.map(node => <g key={node.key}><circle cx={xFor(node)} cy={yFor(node)} r="23" className={node.value === active ? 'tree-node active-node' : 'tree-node'}/><text x={xFor(node)} y={yFor(node) + 5} textAnchor="middle" className="tree-node-label">{node.value}</text><text x={xFor(node) - 34} y={yFor(node) + 4} textAnchor="end" className="tree-side-label">{node.depth === 0 ? 'root' : node.key.at(-1)?.toLowerCase()}</text></g>)}
    {!nodes.length && <text x="310" y="190" textAnchor="middle" className="tree-node-label">Tree is empty</text>}
  </svg>;
}

function HeapView({ event, name, values }: { event: TraceEvent; name: string; values: unknown[] }) {
  const width = 620, maxDepth = Math.min(5, Math.ceil(Math.log2(Math.max(values.length + 1, 2))));
  const point = (index: number) => { const depth = Math.floor(Math.log2(index + 1)); const first = 2 ** depth - 1; const position = index - first; return { x: width * (position + 1) / (2 ** depth + 1), y: 42 + depth * 67 }; };
  const focused = new Set(event.focus.indices || []);
  return <div className="heap-view">
    <svg className="heap-svg" viewBox={`0 0 ${width} ${maxDepth * 68 + 30}`} role="img" aria-label="Heap tree representation">{values.map((value, index) => { const p = point(index); const parentIndex = index ? Math.floor((index - 1) / 2) : -1; const parent = parentIndex >= 0 ? point(parentIndex) : undefined; const edgeActive = focused.has(index) && focused.has(parentIndex); return <g key={index}>{parent && <line x1={parent.x} y1={parent.y} x2={p.x} y2={p.y} className={edgeActive ? 'tree-edge active-edge' : 'tree-edge'}/>}<circle cx={p.x} cy={p.y} r="20" className={focused.has(index) ? 'tree-node active-node' : 'tree-node'}/><text x={p.x} y={p.y + 5} textAnchor="middle" className="tree-node-label">{String(value)}</text></g>; })}</svg>
    <div className="heap-array"><span>{name}</span>{values.map((value, i) => <div className={`matrix-cell ${focused.has(i) ? 'is-focused' : ''}`} key={i}><small>{i}</small><b>{String(value)}</b></div>)}</div>
  </div>;
}

function MappingView({ value }: { value: Record<string, unknown> }) {
  const entries = Object.entries(value).filter(([key]) => !key.startsWith('__'));
  return <div className="mapping-view">{entries.map(([key, val]) => <div className="mapping-entry" key={key}><code>{key}</code><span>→</span><b>{pretty(val)}</b></div>)}{!entries.length && <span className="muted">Empty mapping</span>}</div>;
}

function Visual({ event, animate }: { event?: TraceEvent; animate: boolean }) {
  if (!event) return <div className="empty">Run your Python code to record its execution.</div>;
  if (event.eventType === 'error') return <div className="error visual-error"><AlertCircle/> {event.explanation}</div>;
  const state = event.afterState || event.state;
  const array = findArray(state, event.structure);
  const stringValue = findString(state);
  const linked = findObject(state, 'next');
  const tree = findObject(state, 'left') || findObject(state, 'right');
  const trie = findObject(state, 'children');
  if (event.structure === 'graph') {
    const entry = Object.entries(state).find(([key, value]) => key.toLowerCase().includes('graph') && !!value && typeof value === 'object' && !Array.isArray(value));
    if (entry) return <GraphView event={event} graph={entry[1] as Record<string, unknown>}/>;
  }
  if (event.structure === 'linked-list' && linked) return <LinkedListView event={event} root={linked[1]}/>;
  if (event.structure === 'tree' && tree) return <TreeView event={event} root={tree[1]}/>;
  if (event.structure === 'trie' && trie) return <MappingView value={(trie[1].children || trie[1]) as Record<string, unknown>}/>;
  if (event.structure === 'heap' && array) return <HeapView event={event} name={array[0]} values={array[1]}/>;
  if ((event.structure === 'stack' || event.structure === 'queue' || event.structure === 'deque') && array) return <StackQueueView event={event} values={array[1]} structure={event.structure}/>;
  if (array) return <ArrayView event={event} value={array[1]} name={array[0]} animate={animate}/>;
  if (event.structure === 'string' && stringValue) return <StringView event={event} name={stringValue[0]} value={stringValue[1]}/>;
  if (event.structure === 'hash-table' || event.structure === 'union-find' || event.structure === 'mapping') {
    const entry = Object.entries(state).find(([name, value]) => !!value && typeof value === 'object' && !Array.isArray(value) && !['__builtins__'].includes(name));
    if (entry) return <MappingView value={(entry[1] as Record<string, unknown>)}/>;
  }
  return <pre className="state-view">{JSON.stringify(state, null, 2)}</pre>;
}

function App() {
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

  useEffect(() => {
    if (!running || events.length < 1) return;
    const timer = window.setTimeout(() => {
      if (index >= events.length - 1) setRunning(false);
      else setIndex(current => current + 1);
    }, speed);
    return () => window.clearTimeout(timer);
  }, [running, index, events.length, speed]);

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

  return <div className="app">
    <header><div className="brand"><div className="logo">TF</div><div><h1>TraceForge</h1><span>Python DSA visualizer</span></div></div><div className="header-actions"><button className="ghost" aria-label="Learning resources"><BookOpen size={16}/> Learn</button><button className="ghost" aria-label="Python playground"><Code2 size={16}/> Playground</button></div></header>
    <main><aside className="sidebar"><div className="side-title">WORKSPACE</div><button className="nav active"><Code2/> Editor</button><button className="nav"><GitBranch/> Algorithms</button><button className="nav"><Layers/> Data structures</button><div className="side-title samples">SAMPLES</div>{Object.keys(samples).map(name => <button className={`sample ${sample === name ? 'selected' : ''}`} onClick={() => { setSample(name); setCode(samples[name]); setEvents([]); setIndex(0); }} key={name}>{name}</button>)}</aside>
      <section className="workspace">
        <div className="toolbar"><label className="sample-select-label" htmlFor="sample-select">Example</label><select id="sample-select" value={sample} onChange={e => { setSample(e.target.value); setCode(samples[e.target.value]); setEvents([]); setIndex(0); }}>{Object.keys(samples).map(name => <option key={name}>{name}</option>)}</select>
          <div className="run-controls"><button disabled={!events.length} onClick={() => { setRunning(false); setIndex(0); }} title="Restart replay" aria-label="Restart replay"><RotateCcw size={16}/></button><button disabled={!events.length || index === 0} onClick={() => { setRunning(false); setIndex(i => Math.max(0, i - 1)); }} title="Previous step" aria-label="Previous step"><ChevronLeft size={18}/></button><button className="run" disabled={loading} onClick={() => events.length ? setRunning(value => !value) : run()}>{loading ? <span className="spinner"/> : running ? <Pause size={15}/> : <Play size={15}/>} {loading ? 'Tracing…' : events.length ? running ? 'Pause' : 'Resume' : 'Run code'}</button><button disabled={!events.length || index >= events.length - 1} onClick={() => { setRunning(false); setIndex(i => Math.min(events.length - 1, i + 1)); }} title="Next step" aria-label="Next step"><ChevronRight size={18}/></button><button disabled={!events.length || index >= events.length - 1} onClick={() => { setRunning(false); setIndex(events.length - 1); }} title="Jump to last step" aria-label="Jump to last step"><SkipForward size={16}/></button></div>
          <label className="speed-control">Speed <input aria-label="Playback speed" type="range" min="80" max="1200" step="40" value={1200 - speed} onChange={e => setSpeed(1200 - Number(e.target.value))}/></label>
        </div>
        <div className="panes"><div className="editor-pane"><div className="pane-head"><span>main.py</span><span className="python">PYTHON</span></div><Editor height="100%" language="python" theme="vs-dark" value={code} onChange={value => { setCode(value || ''); setEvents([]); setIndex(0); setRunning(false); }} onMount={editor => { codeEditor.current = editor; }} options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, automaticLayout: true, glyphMargin: true, ariaLabel: 'Python source code editor' }}/></div>
          <div className="visual-pane"><div className="visual-head"><div><span className="eyebrow">EXECUTION VISUALIZATION</span><h2>{event?.structure || 'Ready to trace'}</h2></div><span className="step">{events.length ? `Step ${index + 1} / ${events.length}` : 'No trace yet'}</span></div>
            <div className="canvas"><Visual event={event} animate={animate}/></div><div className="legend" aria-label="Visualization legend"><span><i className="legend-compare"/>Comparison</span><span><i className="legend-change"/>Changed value</span><span><i className="legend-pointer"/>Current pointer</span></div>
            <div className="timeline" aria-label="Execution timeline"><div className="progress" style={{ width: `${progress}%` }}/><input aria-label="Jump to execution step" className="timeline-range" type="range" min="0" max={Math.max(0, events.length - 1)} value={index} disabled={!events.length} onChange={e => { setRunning(false); setIndex(Number(e.target.value)); }}/><div className="timeline-labels"><span>{events.length ? `#${index + 1} · line ${event?.line || '—'}` : 'Run to create steps'}</span><span>{events.length ? `${events.length} events` : '← → keys step · Space plays'}</span></div></div>
            <div className="explain"><span className="event-chip">{event?.eventType || 'READY'}</span><div className="event-description"><b>{event?.explanation || 'Run your Python code to record its actual operations'}</b><small>{event?.statement || 'The source line and exact state will appear here.'}</small></div></div>
          </div>
        </div>
        <div className="bottom">
          <section className="bottom-section"><div className="section-heading"><span className="eyebrow">VARIABLES · {event?.function || '—'}()</span>{event && <span className="depth-pill">depth {event.depth}</span>}</div>{Object.keys(variables).length ? <div className="vars">{Object.entries(variables).map(([key, value]) => <div className="var" key={key}><code>{key}</code><span title={pretty(value)}>{pretty(value)}</span></div>)}</div> : <p className="muted">Variables at this execution point will appear here.</p>}</section>
          <section className="bottom-section call-stack-section"><span className="eyebrow">CALL STACK</span>{event?.callStack.length ? <div className="call-stack">{event.callStack.map((frame, i) => <div className={`call-frame ${i === event.callStack.length - 1 ? 'active-frame' : ''}`} key={`${frame.name}-${i}`}><b>{frame.name}()</b><span>line {frame.line}</span><small>{Object.entries(frame.arguments).map(([k, v]) => `${k}=${pretty(v)}`).join(', ')}</small></div>)}</div> : <p className="muted">No active function calls at this step.</p>}</section>
          <section className="bottom-section event-meta"><span className="eyebrow">SOURCE & OPERATION</span><p className="source-statement"><code>{event?.line ? `${event.line}: ` : ''}{event?.statement || 'Waiting for execution'}</code></p><p className="muted">{event?.operation || '—'}{event?.returnValue !== undefined ? ` · returns ${pretty(event.returnValue)}` : ''}{event?.focus.result ? ` · branch ${event.focus.result}` : ''}</p>{event?.output && <pre className="event-output">{event.output}</pre>}<label className="toggle"><input type="checkbox" checked={animate} onChange={e => setAnimate(e.target.checked)}/> Animate changed values</label><button className="states-toggle" onClick={() => setShowStates(open => !open)}>{showStates ? 'Hide' : 'Inspect'} before / after state</button></section>
        </div>
        {showStates && event && <div className="state-comparison"><div><span className="eyebrow">BEFORE THIS EVENT</span><pre>{beforeText}</pre></div><div><span className="eyebrow">AFTER THIS EVENT</span><pre>{afterText}</pre></div></div>}
        {error && <div className="toast error"><AlertCircle size={18}/>{error}</div>}
      </section>
    </main>
  </div>;
}

createRoot(document.getElementById('root')!).render(<App/>);
