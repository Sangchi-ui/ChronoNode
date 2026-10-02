import { beforeAll, describe, expect, it } from 'vitest';
import { loadPyodide, type PyodideInterface } from 'pyodide';
import { attachDataStructure, buildTraceProgram, type TraceEvent } from './trace';
import { resolveVisualizerRoute, visualizerRoutes } from './visualizer-routing';

const samples: Array<[string, string]> = [
  ['bitwise foundations', `def solve(value):\n    count = 0\n    while value:\n        value &= value - 1\n        count += 1\n    return count\nanswer = solve(13)`],
  ['bit masks', `mask = 1 << 5\nmask ^= 8\nmask |= 2\npresent = bool(mask & 32)`],
  ['two pointers', `values = [1, 2, 4, 7, 11]\nleft, right = 0, len(values) - 1\ntarget = 9\nwhile left < right:\n    total = values[left] + values[right]\n    if total == target:\n        found = (left, right)\n        break\n    if total < target:\n        left += 1\n    else:\n        right -= 1`],
  ['multidimensional arrays', `table = [[0, 0], [0, 0]]\nrow, col = 1, 1\ntable[row][col] = 4`],
  ['sliding window', `values = [2, 1, 5, 1, 3, 2]\nwindow = sum(values[:3])\nbest = window\nfor index in range(3, len(values)):\n    window += values[index] - values[index - 3]\n    best = max(best, window)`],
  ['string palindrome', `text = "level"\nreverse = text[::-1]\nis_palindrome = text == reverse`],
  ['prefix matching', `pattern = "ababaca"\nlps = [0] * len(pattern)\nlength = 0\nindex = 1\nwhile index < len(pattern):\n    if pattern[index] == pattern[length]:\n        length += 1\n        lps[index] = length\n        index += 1\n    elif length:\n        length = lps[length - 1]\n    else:\n        index += 1`],
  ['linked list', `class Node:\n    def __init__(self, value):\n        self.value = value\n        self.next = None\nhead = Node(1)\nhead.next = Node(2)\nhead.next.next = Node(3)\ncurrent = head\nwhile current:\n    current = current.next`],
  ['circular linked list', `class Node:\n    def __init__(self, value):\n        self.value = value\n        self.next = None\nhead = Node(7)\nhead.next = head\ncurrent = head.next`],
  ['stack algorithms', `pending = []\nvalues = [2, 1, 3]\nfor value in values:\n    while pending and pending[-1] < value:\n        pending.pop()\n    pending.append(value)`],
  ['queue and deque', `from collections import deque\nfrontier = deque([0])\nfrontier.append(1)\ncurrent = frontier.popleft()`],
  ['hash maps and sets', `counts = {}\nseen = set()\nfor value in [2, 2, 3]:\n    counts[value] = counts.get(value, 0) + 1\n    seen.add(value)`],
  ['binary search', `values = [1, 3, 5, 7, 9]\nlow, high = 0, len(values)\ntarget = 7\nwhile low < high:\n    middle = (low + high) // 2\n    if values[middle] < target:\n        low = middle + 1\n    else:\n        high = middle`],
  ['sorting', `values = [5, 1, 4, 2]\nfor end in range(len(values) - 1, 0, -1):\n    for index in range(end):\n        if values[index] > values[index + 1]:\n            values[index], values[index + 1] = values[index + 1], values[index]`],
  ['recursion and backtracking', `def subsets(index, values, current, output):\n    if index == len(values):\n        output.append(current[:])\n        return\n    subsets(index + 1, values, current, output)\n    current.append(values[index])\n    subsets(index + 1, values, current, output)\n    current.pop()\noutput = []\nsubsets(0, [1, 2], [], output)`],
  ['binary tree', `class Node:\n    def __init__(self, value):\n        self.value = value\n        self.left = None\n        self.right = None\nroot = Node(2)\nroot.left = Node(1)\nroot.right = Node(3)`],
  ['binary search tree', `class Node:\n    def __init__(self, value):\n        self.value = value\n        self.left = None\n        self.right = None\nroot = Node(2)\nroot.left = Node(1)\nroot.right = Node(3)\npending = []\ncurrent = root\nwhile current or pending:\n    while current:\n        pending.append(current)\n        current = current.left\n    current = pending.pop()\n    current = current.right`],
  ['heap and priority queue', `import heapq\nheap = [7, 2, 8, 1]\nheapq.heapify(heap)\nheapq.heappush(heap, 3)\nsmallest = heapq.heappop(heap)`],
  ['trie', `class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_end = False\nroot = TrieNode()\nroot.children["c"] = TrieNode()\nroot.children["c"].is_end = True`],
  ['graph traversal', `from collections import deque\ngraph = {"A": ["B"], "B": []}\nvisited = {"A"}\nqueue = deque(["A"])\nwhile queue:\n    node = queue.popleft()\n    for neighbor in graph[node]:\n        if neighbor not in visited:\n            visited.add(neighbor)\n            queue.append(neighbor)`],
  ['shortest path', `graph = {"A": {"B": 2}, "B": {}}\ndistances = {"A": 0}\ndistances["B"] = distances["A"] + graph["A"]["B"]`],
  ['minimum spanning tree and DSU', `parent = [0, 1, 2]\nrank = [0, 0, 0]\nroot_a = parent[0]\nroot_b = parent[1]\nif rank[root_a] < rank[root_b]:\n    root_a, root_b = root_b, root_a\nparent[root_b] = root_a\nif rank[root_a] == rank[root_b]:\n    rank[root_a] += 1`],
  ['advanced graph traversal', `graph = {0: [1], 1: [0, 2], 2: []}\ndiscovery = [-1] * 3\nlow = [0] * 3\ntime = 0\ndef visit(node, parent):\n    global time\n    discovery[node] = low[node] = time\n    time += 1\n    for neighbor in graph[node]:\n        if neighbor == parent:\n            continue\n        if discovery[neighbor] < 0:\n            visit(neighbor, node)\n            low[node] = min(low[node], low[neighbor])\n        else:\n            low[node] = min(low[node], discovery[neighbor])\nvisit(0, -1)`],
  ['greedy scheduling', `intervals = [(1, 3), (2, 4), (4, 5)]\nintervals.sort(key=lambda item: item[1])\nselected = []\nend = -1\nfor start, finish in intervals:\n    if start >= end:\n        selected.append((start, finish))\n        end = finish`],
  ['dynamic programming', `weights = [1, 3, 4]\nvalues = [15, 20, 30]\ncapacity = 4\ndp = [[0] * (capacity + 1) for _ in range(len(weights) + 1)]\nfor row in range(1, len(weights) + 1):\n    for size in range(capacity + 1):\n        dp[row][size] = dp[row - 1][size]\n        if weights[row - 1] <= size:\n            dp[row][size] = max(dp[row][size], dp[row - 1][size - weights[row - 1]] + values[row - 1])`],
  ['divide and conquer', `def merge_sort(items):\n    if len(items) < 2:\n        return items\n    middle = len(items) // 2\n    left = merge_sort(items[:middle])\n    right = merge_sort(items[middle:])\n    result = []\n    while left and right:\n        result.append(left.pop(0) if left[0] < right[0] else right.pop(0))\n    return result + left + right\nsorted_values = merge_sort([4, 1, 3, 2])`],
  ['range query', `fenwick = [0, 0, 0, 0, 0]\nindex = 3\nfenwick[index] += 5\nindex += index & -index`],
  ['advanced data structures', `class AVLNode:\n    def __init__(self, key):\n        self.key = key\n        self.left = None\n        self.right = None\n        self.height = 1\nroot = AVLNode(8)\nroot.left = AVLNode(3)`],
  ['advanced strings', `text = "ababa"\npattern = "aba"\nlps = [0] * len(pattern)\nfor index in range(1, len(pattern)):\n    if pattern[index] == pattern[lps[index - 1]]:\n        lps[index] = lps[index - 1] + 1`],
  ['mathematical algorithms', `a, b = 48, 18\nwhile b:\n    a, b = b, a % b\ngcd = a`],
  ['computational geometry', `points = [(0, 0), (2, 0), (1, 3)]\nfirst, second, third = points\ncross = (second[0] - first[0]) * (third[1] - first[1]) - (second[1] - first[1]) * (third[0] - first[0])\norientation = (cross > 0) - (cross < 0)`],
  ['randomized algorithms', `import random\nrandom.seed(3)\nsample = None\nfor count, value in enumerate([4, 5, 6], 1):\n    if random.randrange(count) == 0:\n        sample = value`],
  ['advanced range techniques', `values = [5, 2, 4, 1]\nqueries = [(0, 2), (1, 3)]\nblock = 2\nqueries.sort(key=lambda query: (query[0] // block, query[1]))\nanswer = sum(sum(values[left:right + 1]) for left, right in queries)`],
  ['problem-solving patterns', `values = [1, 1, 2, 3, 3]\nfrequency = {}\nfor value in values:\n    frequency[value] = frequency.get(value, 0) + 1\nanswer = max(frequency.values())`],
];

type RawEvent = Omit<TraceEvent, 'structure'>;
const allowedTypes = new Set(['read', 'write', 'compare', 'assign', 'swap', 'move', 'insert', 'delete', 'push', 'pop', 'enqueue', 'dequeue', 'enqueue-left', 'enqueue-right', 'dequeue-left', 'dequeue-right', 'visit', 'discover', 'relax', 'rotate', 'partition', 'merge', 'split', 'call', 'return', 'branch', 'lookup', 'update', 'backtrack', 'table-read', 'table-write', 'error', 'complete']);
const allowedStructures = new Set(['array', 'bitwise', 'deque', 'dynamic-programming', 'geometry', 'graph', 'hash-table', 'heap', 'linked-list', 'mapping', 'mathematical', 'queue', 'range-query', 'recursion', 'stack', 'string', 'tree', 'trie', 'union-find', 'variables']);
const expectedStructures: Record<string, string> = {
  'bitwise foundations': 'bitwise', 'bit masks': 'bitwise', 'two pointers': 'array', 'multidimensional arrays': 'array',
  'sliding window': 'array', 'string palindrome': 'string', 'prefix matching': 'string', 'advanced strings': 'string',
  'linked list': 'linked-list', 'circular linked list': 'linked-list', 'stack algorithms': 'stack', 'queue and deque': 'deque',
  'hash maps and sets': 'hash-table', 'binary search': 'array', sorting: 'array', 'recursion and backtracking': 'recursion',
  'binary tree': 'tree', 'binary search tree': 'tree', 'advanced data structures': 'tree', 'heap and priority queue': 'heap',
  trie: 'trie', 'graph traversal': 'graph', 'shortest path': 'graph', 'minimum spanning tree and DSU': 'union-find',
  'advanced graph traversal': 'graph', 'greedy scheduling': 'array', 'dynamic programming': 'dynamic-programming',
  'divide and conquer': 'recursion', 'range query': 'range-query', 'mathematical algorithms': 'mathematical',
  'computational geometry': 'geometry', 'randomized algorithms': 'array', 'advanced range techniques': 'range-query',
  'problem-solving patterns': 'hash-table',
};
const requiredDomainProbes = [
  'bitwise foundations', 'multidimensional arrays', 'string palindrome', 'linked list', 'stack algorithms', 'queue and deque',
  'hash maps and sets', 'binary search', 'sorting', 'recursion and backtracking', 'binary tree', 'binary search tree',
  'heap and priority queue', 'trie', 'graph traversal', 'shortest path', 'minimum spanning tree and DSU', 'advanced graph traversal',
  'greedy scheduling', 'dynamic programming', 'divide and conquer', 'range query', 'advanced strings', 'mathematical algorithms',
  'computational geometry', 'advanced data structures', 'bit masks', 'randomized algorithms', 'advanced range techniques', 'problem-solving patterns',
];
let python: PyodideInterface;

beforeAll(async () => { python = await loadPyodide(); }, 30_000);

describe('DSA domain trace audit', () => {
  it('includes a representative executable sample for all 30 requested domain families', () => {
    const available = new Set(samples.map(([name]) => name));
    expect(requiredDomainProbes).toHaveLength(30);
    expect(requiredDomainProbes.filter(name => !available.has(name))).toEqual([]);
  });

  it.each(samples)('%s emits compact, sanitized, render-routable events', async (_domain, code) => {
    const output = await python.runPythonAsync(buildTraceProgram(code, 1000));
    const events = JSON.parse(String(output)) as RawEvent[];
    expect(events.length).toBeGreaterThan(0);
    expect(events.length).toBeLessThanOrEqual(1000);
    expect(events.at(-1)?.eventType, `${_domain}: ${events.at(-1)?.explanation}`).toBe('complete');
    expect(events[0].dataStructure, `${_domain}: backend primary-domain tag`).toBe(expectedStructures[_domain]);

    const routed = attachDataStructure(events, code);
    expect(routed[0].dataStructure, `${_domain}: primary domain tag`).toBe(expectedStructures[_domain]);
    for (const [index, event] of routed.entries()) {
      expect(typeof event.dataStructure).toBe('string');
      expect(allowedTypes.has(event.eventType), `${_domain}: unexpected eventType ${event.eventType}`).toBe(true);
      expect(typeof event.dataStructure).toBe('string');
      expect(event.dataStructure.length).toBeGreaterThan(0);
      expect(allowedStructures.has(event.dataStructure), `${_domain}: unrecognized dataStructure ${event.dataStructure}`).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(visualizerRoutes, event.dataStructure), `${_domain}: no dedicated visualizer route for ${event.dataStructure}`).toBe(true);
      expect(resolveVisualizerRoute(event.dataStructure)).toBe(visualizerRoutes[event.dataStructure as keyof typeof visualizerRoutes]);
      expect(event.step).toBe(index + 1);
      expect(event.line).toBeGreaterThanOrEqual(0);
      expect(event.line).toBeLessThanOrEqual(code.split('\n').length);
      expect(event.function).not.toMatch(/^<(?:listcomp|setcomp|dictcomp|genexpr)>$/);
      expect(event.statement.trim()).not.toMatch(/^(?:import\s|from\s|class\s)/);
      expect(event.beforeState).toBeTypeOf('object');
      expect(event.afterState).toBeTypeOf('object');
      expect(Array.isArray(event.callStack)).toBe(true);
      expect(event.lineComplexity).toEqual(expect.objectContaining({ time: expect.any(String), timeDetails: expect.any(String), space: expect.any(String), spaceDetails: expect.any(String) }));
      expect(event.lineComplexity.timeDetails.length).toBeGreaterThan(0);
      expect(event.lineComplexity.spaceDetails.length).toBeGreaterThan(0);
      expect(event.lineComplexity.time).not.toBe('O(?)');
      expect(event.lineComplexity.space).not.toBe('O(?)');
    }

    const serialized = JSON.stringify(routed);
    expect(serialized).not.toContain('__dict__');
    expect(serialized).not.toContain('<function ');
    expect(routed.length).toBeLessThan(400);
  });
});