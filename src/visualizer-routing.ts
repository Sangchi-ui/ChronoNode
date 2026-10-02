export const visualizerRoutes = {
  array: 'array',
  searching: 'array',
  sorting: 'array',
  'dynamic-programming': 'dynamic-programming',
  string: 'string',
  'pattern-matching': 'string',
  'linked-list': 'linked-list',
  stack: 'stack',
  queue: 'queue',
  deque: 'deque',
  'hash-table': 'hash-table',
  hashing: 'hash-table',
  mapping: 'hash-table',
  tree: 'tree',
  'binary-search-tree': 'tree',
  avl: 'tree',
  trie: 'trie',
  heap: 'heap',
  'priority-queue': 'heap',
  graph: 'graph',
  'shortest-path': 'graph',
  mst: 'graph',
  'union-find': 'union-find',
  recursion: 'recursion',
  backtracking: 'recursion',
  bitwise: 'bitwise',
  geometry: 'geometry',
  mathematical: 'mathematical',
  'range-query': 'range-query',
  variables: 'variables',
} as const;

export type VisualizerRoute = typeof visualizerRoutes[keyof typeof visualizerRoutes];

export function resolveVisualizerRoute(dataStructure: string): VisualizerRoute {
  return visualizerRoutes[dataStructure as keyof typeof visualizerRoutes] || 'variables';
}