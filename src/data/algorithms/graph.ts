import type { AlgorithmData } from './types';

export const graphAlgorithms: AlgorithmData[] = [
  {
    id: 'dijkstra',
    name: 'Dijkstra’s Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O((V + E) log V)', space: 'O(V)' },
    explanation: 'Finds the shortest paths between nodes in a graph with non-negative edge weights using a priority queue to greedily expand the closest unvisited vertex.',
    realWorldExample: 'A GPS navigation system finding the fastest driving route from your home to downtown across a highway network with varying speed limits.',
    stepByStepLogic: [
      '1. Initialize distances to all vertices as infinity, and distance to start node as 0.',
      '2. Insert (0, start) into a priority queue (min-heap).',
      '3. Extract vertex u with the smallest distance from the heap.',
      '4. For each neighbor v of u with edge weight w, if dist[u] + w < dist[v]:',
      '5. Update dist[v] = dist[u] + w and push (dist[v], v) to the heap.',
      '6. Repeat until the heap is empty.'
    ],
    pythonCode: `# Dijkstra's Algorithm
import heapq

def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    while pq:
        cur_dist, u = heapq.heappop(pq)
        if cur_dist > distances[u]:
            continue
        for v, weight in graph[u].items():
            dist = cur_dist + weight
            if dist < distances[v]:
                distances[v] = dist
                heapq.heappush(pq, (dist, v))
    return distances

network = {
    'A': {'B': 4, 'C': 2},
    'B': {'A': 4, 'C': 1, 'D': 5},
    'C': {'A': 2, 'B': 1, 'D': 8},
    'D': {'B': 5, 'C': 8}
}
print(dijkstra(network, 'A'))
`
  },
  {
    id: 'bellman-ford',
    name: 'Bellman-Ford Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(V · E)', space: 'O(V)' },
    explanation: 'Computes shortest paths from a single source vertex to all other vertices in a weighted graph, capable of handling negative edge weights and detecting negative weight cycles.',
    realWorldExample: 'Financial arbitrage detection where currency exchange rates are mapped as negative logarithmic edge weights, signaling profit opportunities if a negative cycle is found.',
    stepByStepLogic: [
      '1. Set distance to source = 0 and all other vertices = infinity.',
      '2. Relax all edges in the graph V - 1 times.',
      '3. For each edge (u, v) with weight w: if dist[u] + w < dist[v], update dist[v] = dist[u] + w.',
      '4. Perform a V-th iteration: if any edge can still be relaxed, a negative cycle exists.'
    ],
    pythonCode: `# Bellman-Ford Algorithm
def bellman_ford(vertices, edges, source):
    dist = {v: float('inf') for v in vertices}
    dist[source] = 0
    for _ in range(len(vertices) - 1):
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            return "Negative weight cycle detected"
    return dist

nodes = ['A', 'B', 'C', 'D']
edge_list = [('A', 'B', 4), ('A', 'C', 5), ('B', 'D', 3), ('C', 'B', -2), ('D', 'C', 1)]
print(bellman_ford(nodes, edge_list, 'A'))
`
  },
  {
    id: 'floyd-warshall',
    name: 'Floyd-Warshall Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(V³)', space: 'O(V²)' },
    explanation: 'A dynamic programming algorithm that finds the shortest paths between all pairs of vertices in a directed, weighted graph without negative cycles.',
    realWorldExample: 'An airline flight network calculating the shortest travel time between every possible pair of airports around the world with layovers.',
    stepByStepLogic: [
      '1. Initialize dist[i][j] with edge weights, 0 on the diagonal, and infinity otherwise.',
      '2. Iterate through each intermediate vertex k from 0 to V - 1.',
      '3. In nested loops over all pairs (i, j), update dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]).',
      '4. Dist matrix now holds all-pairs shortest paths.'
    ],
    pythonCode: `# Floyd-Warshall Algorithm
def floyd_warshall(matrix):
    v = len(matrix)
    dist = [row[:] for row in matrix]
    for k in range(v):
        for i in range(v):
            for j in range(v):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    return dist

inf = float('inf')
graph_mat = [
    [0, 5, inf, 10],
    [inf, 0, 3, inf],
    [inf, inf, 0, 1],
    [inf, inf, inf, 0]
]
print("All pairs distances:", floyd_warshall(graph_mat))
`
  },
  {
    id: 'johnsons-algorithm',
    name: 'Johnson’s Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(V² log V + V · E)', space: 'O(V²)' },
    explanation: 'Finds all-pairs shortest paths on sparse graphs by reweighting edges using Bellman-Ford to eliminate negative weights, then running Dijkstra from every vertex.',
    realWorldExample: 'Normalizing toll charges across a nationwide highway network to guarantee no road has a negative cost, allowing high-speed Dijkstra routing for every city.',
    stepByStepLogic: [
      '1. Add a dummy vertex s with 0-weight edges to all vertices.',
      '2. Run Bellman-Ford from s to compute potential function h(u) for each node.',
      '3. Reweight every edge: w\'(u, v) = w(u, v) + h(u) - h(v) >= 0.',
      '4. Run Dijkstra from each vertex using reweighted edges.',
      '5. Convert back to original distances: dist(u, v) = dist\'(u, v) - h(u) + h(v).'
    ],
    pythonCode: `# Johnson's Algorithm (Conceptual Flow)
import heapq

def dijkstra_reweighted(graph, src, h):
    dist = {u: float('inf') for u in graph}
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue
        for v, w in graph[u]:
            reweighted = w + h[u] - h[v]
            if dist[u] + reweighted < dist[v]:
                dist[v] = dist[u] + reweighted
                heapq.heappush(pq, (dist[v], v))
    return {v: dist[v] - h[src] + h[v] for v in dist}

adj = {0: [(1, 2), (2, 5)], 1: [(2, 1)], 2: []}
h_potentials = {0: 0, 1: 0, 2: 0}
print("Distances from 0:", dijkstra_reweighted(adj, 0, h_potentials))
`
  },
  {
    id: 'a-star-search',
    name: 'A* Search Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(E)', space: 'O(V)' },
    explanation: 'An informed search algorithm that finds the shortest path by evaluating nodes with f(n) = g(n) + h(n), combining actual cost g(n) and heuristic estimate h(n) to goal.',
    realWorldExample: 'Video game AI pathfinding where an enemy moves toward the player by balancing travel distance with Euclidean straight-line distance to target.',
    stepByStepLogic: [
      '1. Add start node to open set priority queue with f = h(start).',
      '2. Pop node with lowest f-score.',
      '3. If current node is the goal, reconstruct and return path.',
      '4. For each neighbor: tentatively compute g = g(current) + cost.',
      '5. If new g < known g(neighbor), update path, g-score, and push with f = g + h(neighbor).'
    ],
    pythonCode: `# A* Search Algorithm on Grid
import heapq

def a_star(start, goal, obstacles):
    def heuristic(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    open_set = [(heuristic(start, goal), 0, start, [start])]
    visited = set()
    while open_set:
        f, g, cur, path = heapq.heappop(open_set)
        if cur == goal:
            return path
        if cur in visited:
            continue
        visited.add(cur)
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            nbr = (cur[0] + dx, cur[1] + dy)
            if nbr not in obstacles and nbr not in visited:
                heapq.heappush(open_set, (g + 1 + heuristic(nbr, goal), g + 1, nbr, path + [nbr]))
    return None

print("Path:", a_star((0, 0), (2, 2), obstacles={(1, 1)}))
`
  },
  {
    id: 'bidirectional-search',
    name: 'Bidirectional Search',
    category: 'Graph Algorithms',
    complexity: { time: 'O(b^(d/2))', space: 'O(b^(d/2))' },
    explanation: 'Runs two simultaneous searches: one forward from the source and one backward from the target, halting when their search frontiers intersect.',
    realWorldExample: 'Two construction teams digging a tunnel through a mountain from opposite sides simultaneously, meeting in the middle to halve the drilling time.',
    stepByStepLogic: [
      '1. Initialize forward queue from source and backward queue from target.',
      '2. Maintain forward_visited and backward_visited sets.',
      '3. Expand one layer in the forward direction, checking for intersection with backward set.',
      '4. Expand one layer in the backward direction, checking for intersection with forward set.',
      '5. When a common node is found, merge paths.'
    ],
    pythonCode: `# Bidirectional BFS
from collections import deque

def bidirectional_search(graph, start, target):
    if start == target:
        return [start]
    q_forward = deque([start])
    q_backward = deque([target])
    visited_f = {start: None}
    visited_b = {target: None}

    while q_forward and q_backward:
        u = q_forward.popleft()
        for v in graph.get(u, []):
            if v in visited_b:
                return f"Met at {v}"
            if v not in visited_f:
                visited_f[v] = u
                q_forward.append(v)
        u_b = q_backward.popleft()
        for v in graph.get(u_b, []):
            if v in visited_f:
                return f"Met at {v}"
            if v not in visited_b:
                visited_b[v] = u_b
                q_backward.append(v)
    return None

graph = {'A': ['B'], 'B': ['A', 'C'], 'C': ['B', 'D'], 'D': ['C']}
print(bidirectional_search(graph, 'A', 'D'))
`
  },
  {
    id: 'kruskals-algorithm',
    name: 'Kruskal’s Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(E log E)', space: 'O(V)' },
    explanation: 'A greedy algorithm that finds a Minimum Spanning Tree (MST) by sorting all edges by weight and adding them to the tree if they do not create a cycle (using Disjoint Set Union).',
    realWorldExample: 'Connecting an archipelago of islands with underwater power cables using the cheapest cables first, skipping any cable that links islands already connected.',
    stepByStepLogic: [
      '1. Sort all edges in non-decreasing order of weight.',
      '2. Initialize a Disjoint Set Union (DSU) structure for all V vertices.',
      '3. Iterate through sorted edges (u, v, w):',
      '4. If find(u) != find(v), union(u, v) and add edge to the MST.',
      '5. Stop when MST contains V - 1 edges.'
    ],
    pythonCode: `# Kruskal's Algorithm
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
    def find(self, i):
        if self.parent[i] == i:
            return i
        self.parent[i] = self.find(self.parent[i])
        return self.parent[i]
    def union(self, i, j):
        root_i, root_j = self.find(i), self.find(j)
        if root_i != root_j:
            self.parent[root_i] = root_j
            return True
        return False

def kruskal(n, edges):
    edges.sort(key=lambda x: x[2])
    dsu = DSU(n)
    mst = []
    for u, v, w in edges:
        if dsu.union(u, v):
            mst.append((u, v, w))
            if len(mst) == n - 1:
                break
    return mst

edges = [(0, 1, 10), (0, 2, 6), (0, 3, 5), (1, 3, 15), (2, 3, 4)]
print("MST:", kruskal(4, edges))
`
  },
  {
    id: 'prims-algorithm',
    name: 'Prim’s Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(E log V)', space: 'O(V)' },
    explanation: 'Finds a Minimum Spanning Tree by starting from an arbitrary vertex and growing the tree by iteratively adding the cheapest edge connecting a visited vertex to an unvisited vertex.',
    realWorldExample: 'Expanding a fiber-optic broadband network from a central city hub by repeatedly paving the shortest road to the nearest unconnected neighboring town.',
    stepByStepLogic: [
      '1. Choose an arbitrary starting vertex and mark it visited.',
      '2. Push all incident edges of the start node into a min-heap.',
      '3. Extract the minimum edge (weight, to_node) from the heap.',
      '4. If to_node is already visited, discard it.',
      '5. Mark to_node as visited, add edge to MST, and push all its edges to unvisited neighbors.',
      '6. Repeat until all vertices are visited.'
    ],
    pythonCode: `# Prim's Algorithm
import heapq

def prim(n, graph):
    visited = set()
    mst_cost = 0
    pq = [(0, 0)] # (weight, node)
    while pq and len(visited) < n:
        weight, u = heapq.heappop(pq)
        if u in visited:
            continue
        visited.add(u)
        mst_cost += weight
        for v, w in graph.get(u, []):
            if v not in visited:
                heapq.heappush(pq, (w, v))
    return mst_cost

adj = {
    0: [(1, 4), (2, 3)],
    1: [(0, 4), (2, 1), (3, 2)],
    2: [(0, 3), (1, 1), (3, 4)],
    3: [(1, 2), (2, 4)]
}
print("Total MST Cost:", prim(4, adj))
`
  },
  {
    id: 'boruvkas-algorithm',
    name: 'Borůvka\'s Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(E log V)', space: 'O(V)' },
    explanation: 'The oldest MST algorithm: finds the minimum spanning tree by having each connected component concurrently connect to its cheapest external neighbor in O(log V) stages.',
    realWorldExample: 'Isolated frontier settlements concurrently paving a road to their single closest neighboring town until all settlements form one unified road network.',
    stepByStepLogic: [
      '1. Start with V separate components (each vertex is its own component).',
      '2. For each component, identify the cheapest edge connecting it to another component.',
      '3. Add all chosen cheapest edges to the MST and union the components.',
      '4. Repeat until only a single component remains.'
    ],
    pythonCode: `# Borůvka's Algorithm (Conceptual Steps)
def boruvka(n, edges):
    parent = list(range(n))
    def find(i):
        if parent[i] == i: return i
        parent[i] = find(parent[i]); return parent[i]
    def union(i, j):
        ri, rj = find(i), find(j)
        if ri != rj: parent[ri] = rj; return True
        return False

    num_components = n
    mst_weight = 0
    while num_components > 1:
        cheapest = [-1] * n
        for idx, (u, v, w) in enumerate(edges):
            ru, rv = find(u), find(v)
            if ru != rv:
                if cheapest[ru] == -1 or edges[cheapest[ru]][2] > w: cheapest[ru] = idx
                if cheapest[rv] == -1 or edges[cheapest[rv]][2] > w: cheapest[rv] = idx
        for idx in cheapest:
            if idx != -1:
                u, v, w = edges[idx]
                if union(u, v):
                    mst_weight += w
                    num_components -= 1
    return mst_weight

edge_list = [(0, 1, 2), (1, 2, 3), (0, 3, 6), (1, 3, 8), (1, 4, 5), (2, 4, 7), (3, 4, 9)]
print("Borůvka MST Weight:", boruvka(5, edge_list))
`
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    category: 'Graph Algorithms',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    explanation: 'Explores graph vertices layer by layer in expanding concentric circles using a FIFO queue, finding unweighted shortest paths naturally.',
    realWorldExample: 'Ripples spreading across a pond when a pebble is dropped, hitting nearby reeds first before reaching the outer banks.',
    stepByStepLogic: [
      '1. Enqueue start node and mark it as visited.',
      '2. While queue is not empty, dequeue current node u.',
      '3. For each unvisited neighbor v of u: mark v as visited and enqueue v.',
      '4. Process node u (e.g. record order or distance).',
      '5. Continue until the queue is exhausted.'
    ],
    pythonCode: `# Breadth-First Search
from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order

g = {'A': ['B', 'C'], 'B': ['D', 'E'], 'C': ['F'], 'D': [], 'E': [], 'F': []}
print("BFS Order:", bfs(g, 'A'))
`
  },
  {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    category: 'Graph Algorithms',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    explanation: 'Explores as far as possible along each branch before backtracking using a LIFO stack or recursive function calls.',
    realWorldExample: 'Solving a physical hedge maze by always following the right-hand wall until you hit a dead end, then backtracking to the last crossroads.',
    stepByStepLogic: [
      '1. Mark current node as visited.',
      '2. Process current node.',
      '3. For each unvisited neighbor: recursively invoke DFS on that neighbor.',
      '4. Backtrack when all neighbors of the current node have been explored.'
    ],
    pythonCode: `# Depth-First Search
def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    order = [node]
    for neighbor in graph.get(node, []):
        if neighbor not in visited:
            order.extend(dfs(graph, neighbor, visited))
    return order

g = {'A': ['B', 'C'], 'B': ['D'], 'C': ['E'], 'D': [], 'E': []}
print("DFS Order:", dfs(g, 'A'))
`
  },
  {
    id: 'kosarajus-algorithm',
    name: 'Kosaraju’s Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    explanation: 'Finds all Strongly Connected Components (SCCs) in a directed graph using two DFS passes: one to order vertices by exit times, and a second DFS on the transposed graph.',
    realWorldExample: 'Identifying mutual communication groups on social media where every person in a cluster can both send and receive messages to anyone else in that cluster.',
    stepByStepLogic: [
      '1. Perform DFS on the graph, pushing finished nodes onto a stack.',
      '2. Reverse all edges to produce transposed graph G^T.',
      '3. Pop vertices from the stack one by one.',
      '4. If vertex is unvisited in G^T, run DFS to collect all vertices in its SCC.'
    ],
    pythonCode: `# Kosaraju's SCC Algorithm
def kosaraju(adj):
    visited = set()
    stack = []
    def dfs1(u):
        visited.add(u)
        for v in adj.get(u, []):
            if v not in visited: dfs1(v)
        stack.append(u)
    for node in adj:
        if node not in visited: dfs1(node)
    transpose = {u: [] for u in adj}
    for u in adj:
        for v in adj[u]: transpose[v].append(u)
    visited.clear()
    sccs = []
    def dfs2(u, component):
        visited.add(u); component.append(u)
        for v in transpose.get(u, []):
            if v not in visited: dfs2(v, component)
    while stack:
        u = stack.pop()
        if u not in visited:
            comp = []
            dfs2(u, comp)
            sccs.append(comp)
    return sccs

graph = {0: [2, 3], 1: [0], 2: [1], 3: [4], 4: []}
print("SCCs:", kosaraju(graph))
`
  },
  {
    id: 'tarjans-scc',
    name: 'Tarjan’s Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    explanation: 'Finds all Strongly Connected Components in a single DFS traversal using discovery times and low-link values tracked on an active DFS recursion stack.',
    realWorldExample: 'Tracing looped power grids in a circuit in a single pass to identify self-sustaining sub-grids that remain energized if isolated.',
    stepByStepLogic: [
      '1. Maintain timer, discovery times disc[], and lowest reachable low[].',
      '2. Push node u onto stack. For each neighbor v: if unvisited, recurse and low[u] = min(low[u], low[v]).',
      '3. Else if v is on stack: low[u] = min(low[u], disc[v]).',
      '4. If disc[u] == low[u], pop elements from stack until u to form an SCC.'
    ],
    pythonCode: `# Tarjan's Strongly Connected Components
def tarjan_scc(graph):
    index = 0
    indices = {}
    lowlink = {}
    stack = []
    on_stack = set()
    sccs = []

    def strongconnect(node):
        nonlocal index
        indices[node] = index
        lowlink[node] = index
        index += 1
        stack.append(node)
        on_stack.add(node)
        for nbr in graph.get(node, []):
            if nbr not in indices:
                strongconnect(nbr)
                lowlink[node] = min(lowlink[node], lowlink[nbr])
            elif nbr in on_stack:
                lowlink[node] = min(lowlink[node], indices[nbr])
        if lowlink[node] == indices[node]:
            scc = []
            while True:
                w = stack.pop()
                on_stack.remove(w)
                scc.append(w)
                if w == node: break
            sccs.append(scc)

    for v in graph:
        if v not in indices: strongconnect(v)
    return sccs

g = {'A': ['B'], 'B': ['C'], 'C': ['A', 'D'], 'D': ['E'], 'E': ['D']}
print("SCCs:", tarjan_scc(g))
`
  },
  {
    id: 'fleurys-algorithm',
    name: 'Fleury’s Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(E²)', space: 'O(V + E)' },
    explanation: 'Constructs an Eulerian path or circuit by traversing edges one by one, never traversing a bridge (cut edge) unless no other edge is available.',
    realWorldExample: 'A mail carrier walking every street in a neighborhood exactly once without crossing the same bridge twice unless it is the only way forward.',
    stepByStepLogic: [
      '1. Verify graph has 0 or 2 vertices with odd degree.',
      '2. Start at an odd-degree vertex (or any vertex if all degrees are even).',
      '3. At each step, select an edge that is not a bridge of the remaining graph.',
      '4. If only bridges remain, traverse the bridge.',
      '5. Remove edge and repeat until no edges remain.'
    ],
    pythonCode: `# Fleury's Algorithm (Simplified)
def is_bridge(adj, u, v):
    # If degree is 1, it's the only edge
    return len(adj[u]) == 1

def fleury(adj, start):
    path = [start]
    u = start
    while any(adj.values()):
        for v in list(adj[u]):
            if not is_bridge(adj, u, v) or len(adj[u]) == 1:
                adj[u].remove(v)
                adj[v].remove(u)
                u = v
                path.append(u)
                break
    return path

graph = {0: [1, 2], 1: [0, 2], 2: [0, 1]}
print("Eulerian circuit:", fleury(graph, 0))
`
  },
  {
    id: 'hierholzers-algorithm',
    name: 'Hierholzer’s Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(E)', space: 'O(V + E)' },
    explanation: 'Finds an Eulerian path or circuit in linear time by following unused edges to form sub-tours, then splicing those sub-tours together onto a main path.',
    realWorldExample: 'Drawing a complex figure in a single unbroken stroke with a pencil without lifting it or retracing any line.',
    stepByStepLogic: [
      '1. Start at a vertex with odd degree (or any vertex if all are even).',
      '2. Push current node onto stack.',
      '3. If current node has remaining edges, follow one and push new vertex to stack.',
      '4. If current node has no remaining edges, pop and prepend to Eulerian path.',
      '5. Repeat until stack is empty.'
    ],
    pythonCode: `# Hierholzer's Algorithm
def hierholzer(adj, start):
    graph = {k: list(v) for k, v in adj.items()}
    stack = [start]
    circuit = []
    while stack:
        cur = stack[-1]
        if graph.get(cur):
            nxt = graph[cur].pop()
            graph[nxt].remove(cur)
            stack.append(nxt)
        else:
            circuit.append(stack.pop())
    return circuit[::-1]

adj_list = {0: [1, 2], 1: [0, 2], 2: [0, 1]}
print("Eulerian tour:", hierholzer(adj_list, 0))
`
  },
  {
    id: 'hopcroft-karp',
    name: 'Hopcroft-Karp Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(E √V)', space: 'O(V)' },
    explanation: 'Computes maximum cardinality matching in a bipartite graph by finding maximal sets of shortest augmenting paths in each phase using alternating BFS and DFS.',
    realWorldExample: 'Pairing interns with open job positions based on compatibility where multiple matching candidates are linked in batch rounds.',
    stepByStepLogic: [
      '1. Use BFS to find the length of the shortest augmenting paths and construct a layered graph.',
      '2. Use DFS to find a maximal set of vertex-disjoint augmenting paths of this minimal length.',
      '3. Augment matching along these paths.',
      '4. Repeat until BFS can find no further augmenting paths.'
    ],
    pythonCode: `# Hopcroft-Karp Bipartite Matching (Demonstration)
from collections import deque

def hopcroft_karp(u_set, graph):
    pair_u = {u: None for u in u_set}
    pair_v = {}
    dist = {}

    def bfs():
        q = deque()
        for u in u_set:
            if pair_u[u] is None:
                dist[u] = 0; q.append(u)
            else:
                dist[u] = float('inf')
        dist[None] = float('inf')
        while q:
            u = q.popleft()
            if dist[u] < dist[None]:
                for v in graph.get(u, []):
                    nxt = pair_v.get(v)
                    if dist.get(nxt, float('inf')) == float('inf'):
                        dist[nxt] = dist[u] + 1
                        q.append(nxt)
        return dist[None] != float('inf')

    matching = 0
    while bfs():
        for u in u_set:
            if pair_u[u] is None:
                for v in graph.get(u, []):
                    if pair_v.get(v) is None:
                        pair_u[u] = v; pair_v[v] = u; matching += 1; break
    return matching

bipartite = {1: ['A', 'B'], 2: ['A'], 3: ['C']}
print("Max Matchings:", hopcroft_karp([1, 2, 3], bipartite))
`
  },
  {
    id: 'kahns-algorithm',
    name: 'Kahn’s Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    explanation: 'A topological sorting algorithm that repeatedly removes vertices with in-degree 0 and decrements the in-degree of their outgoing neighbors, detecting cycles if output length < V.',
    realWorldExample: 'Determining the sequence of college courses to take based on prerequisite requirements, starting with courses that require no prerequisites.',
    stepByStepLogic: [
      '1. Compute in-degree for every vertex.',
      '2. Enqueue all vertices with in-degree 0 into a queue.',
      '3. While queue is not empty: pop node u, append to topological order.',
      '4. For each neighbor v of u: decrement in-degree[v]; if it becomes 0, enqueue v.',
      '5. If topological order length != V, the graph has a cycle.'
    ],
    pythonCode: `# Kahn's Algorithm for Topological Sort
from collections import deque

def kahn_topo_sort(num_nodes, edges):
    in_degree = {i: 0 for i in range(num_nodes)}
    adj = {i: [] for i in range(num_nodes)}
    for u, v in edges:
        adj[u].append(v)
        in_degree[v] += 1
    queue = deque([k for k, v in in_degree.items() if v == 0])
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)
    return order if len(order) == num_nodes else "Cycle detected"

prereqs = [(0, 1), (0, 2), (1, 3), (2, 3)]
print("Course Order:", kahn_topo_sort(4, prereqs))
`
  },
  {
    id: 'dfs-topological-sort',
    name: 'DFS-based Topological Sort',
    category: 'Graph Algorithms',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    explanation: 'Computes topological order by performing a depth-first search on a directed acyclic graph and prepending each vertex to a list upon finishing its exploration.',
    realWorldExample: 'Resolving software build dependency packages where leaf dependencies finish compiling before parent libraries can link.',
    stepByStepLogic: [
      '1. Maintain visited set and path set for cycle detection.',
      '2. For each unvisited node, launch DFS.',
      '3. In DFS, visit neighbors recursively.',
      '4. When all neighbors of node u are finished, append u to stack.',
      '5. Reverse the stack at the end to get topological ordering.'
    ],
    pythonCode: `# DFS-based Topological Sort
def dfs_topo_sort(graph):
    visited = set()
    order = []
    def dfs(u):
        visited.add(u)
        for v in graph.get(u, []):
            if v not in visited:
                dfs(v)
        order.append(u)
    for node in graph:
        if node not in visited:
            dfs(node)
    return order[::-1]

dag = {'A': ['B', 'C'], 'B': ['D'], 'C': ['D'], 'D': []}
print("Topo Order:", dfs_topo_sort(dag))
`
  },
  {
    id: 'ford-fulkerson',
    name: 'Ford-Fulkerson Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(E · max_flow)', space: 'O(V)' },
    explanation: 'Computes maximum network flow from source to sink by repeatedly finding augmenting paths with available capacity and pushing residual flow until no path remains.',
    realWorldExample: 'Measuring the maximum volume of water that can flow through a municipal pipe network with varying pipe diameter bottleneck capacities.',
    stepByStepLogic: [
      '1. Initialize total flow to 0 and build residual graph with initial edge capacities.',
      '2. Find any path from source to sink in the residual graph with capacity > 0.',
      '3. Determine bottleneck capacity bottleneck along the path.',
      '4. Increase flow by bottleneck, decrease forward capacities, and increase reverse capacities.',
      '5. Repeat until no augmenting path can be found.'
    ],
    pythonCode: `# Ford-Fulkerson Algorithm (DFS Augmenting Paths)
def dfs_augment(r_graph, s, t, visited, flow):
    if s == t: return flow
    visited.add(s)
    for v in r_graph.get(s, {}):
        cap = r_graph[s][v]
        if v not in visited and cap > 0:
            pushed = dfs_augment(r_graph, v, t, visited, min(flow, cap))
            if pushed > 0:
                r_graph[s][v] -= pushed
                r_graph[v][s] = r_graph.get(v, {}).get(s, 0) + pushed
                return pushed
    return 0

def ford_fulkerson(graph, source, sink):
    r_graph = {u: dict(graph[u]) for u in graph}
    for u in graph:
        for v in graph[u]:
            if v not in r_graph: r_graph[v] = {}
            if u not in r_graph[v]: r_graph[v][u] = 0
    max_flow = 0
    while True:
        visited = set()
        pushed = dfs_augment(r_graph, source, sink, visited, float('inf'))
        if pushed == 0: break
        max_flow += pushed
    return max_flow

capacities = {
    'S': {'A': 10, 'B': 5},
    'A': {'C': 4, 'B': 15},
    'B': {'C': 8, 'T': 6},
    'C': {'T': 10},
    'T': {}
}
print("Max Flow:", ford_fulkerson(capacities, 'S', 'T'))
`
  },
  {
    id: 'edmonds-karp',
    name: 'Edmonds-Karp Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(V · E²)', space: 'O(V + E)' },
    explanation: 'An implementation of the Ford-Fulkerson method that uses Breadth-First Search (BFS) to find shortest augmenting paths, guaranteeing polynomial time complexity.',
    realWorldExample: 'Directing highway traffic during evacuations by always routing cars along the path that takes the fewest highway interchanges.',
    stepByStepLogic: [
      '1. Use BFS to find the augmenting path with the fewest edges in the residual graph.',
      '2. Track parent pointers to reconstruct the path from sink to source.',
      '3. Calculate the minimum capacity bottleneck along the path.',
      '4. Update residual capacities for forward and backward edges.',
      '5. Repeat BFS until the sink is unreachable from the source.'
    ],
    pythonCode: `# Edmonds-Karp Algorithm
from collections import deque

def edmonds_karp(capacity, s, t):
    n = len(capacity)
    flow = [[0] * n for _ in range(n)]
    max_flow = 0
    while True:
        parent = [-1] * n
        parent[s] = s
        q = deque([s])
        while q and parent[t] == -1:
            u = q.popleft()
            for v in range(n):
                if parent[v] == -1 and capacity[u][v] - flow[u][v] > 0:
                    parent[v] = u
                    q.append(v)
        if parent[t] == -1:
            break
        path_flow = float('inf')
        cur = t
        while cur != s:
            p = parent[cur]
            path_flow = min(path_flow, capacity[p][cur] - flow[p][cur])
            cur = p
        cur = t
        while cur != s:
            p = parent[cur]
            flow[p][cur] += path_flow
            flow[cur][p] -= path_flow
            cur = p
        max_flow += path_flow
    return max_flow

cap_mat = [
    [0, 16, 13, 0, 0, 0],
    [0, 0, 10, 12, 0, 0],
    [0, 4, 0, 0, 14, 0],
    [0, 0, 9, 0, 0, 20],
    [0, 0, 0, 7, 0, 4],
    [0, 0, 0, 0, 0, 0]
]
print("Max Flow:", edmonds_karp(cap_mat, 0, 5))
`
  },
  {
    id: 'dinics-algorithm',
    name: 'Dinic’s Algorithm',
    category: 'Graph Algorithms',
    complexity: { time: 'O(V² · E)', space: 'O(V + E)' },
    explanation: 'A strongly polynomial maximum flow algorithm using BFS to build a level graph and DFS to send blocking flows along shortest paths simultaneously.',
    realWorldExample: 'A subway network dispatch system sending train cars in synchronized waves through multiple parallel tracks layer by layer.',
    stepByStepLogic: [
      '1. Run BFS on residual graph to construct level graph (node depths from source).',
      '2. If sink is not reached, terminate.',
      '3. Run DFS using pointer array to push multiple blocking flows through the level graph.',
      '4. Repeat until no more augmenting paths can be constructed.'
    ],
    pythonCode: `# Dinic's Algorithm (Conceptual Demonstration)
from collections import deque

class Dinic:
    def __init__(self, n):
        self.n = n
        self.adj = [[] for _ in range(n)]
        self.level = [-1] * n

    def add_edge(self, u, v, cap):
        self.adj[u].append([v, cap, len(self.adj[v])])
        self.adj[v].append([u, 0, len(self.adj[u]) - 1])

    def bfs(self, s, t):
        self.level = [-1] * self.n
        self.level[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v, cap, _ in self.adj[u]:
                if cap > 0 and self.level[v] < 0:
                    self.level[v] = self.level[u] + 1
                    q.append(v)
        return self.level[t] >= 0

d = Dinic(4)
d.add_edge(0, 1, 10)
d.add_edge(1, 3, 10)
print("Level graph reachable:", d.bfs(0, 3))
`
  },
  {
    id: 'push-relabel',
    name: 'Push-Relabel Algorithm (Tarjan\'s)',
    category: 'Graph Algorithms',
    complexity: { time: 'O(V² · E) or O(V³)', space: 'O(V²)' },
    explanation: 'Maintains preflow in network vertices where node height levels allow excess flow to be pushed downhill to neighbors, relabeling vertices when flow is blocked.',
    realWorldExample: 'Water flowing down a terraced hillside: water pools in stepped basins and either spills down to lower terraces or the terrace is raised to force water out.',
    stepByStepLogic: [
      '1. Initialize height[source] = V, height[all other] = 0.',
      '2. Saturate all edges leaving source, creating excess flow in neighbors.',
      '3. While any non-sink vertex has excess flow:',
      '4. Push flow to any neighbor with height[u] == height[v] + 1.',
      '5. If no valid downhill neighbor exists, relabel height[u] = 1 + min(height[v]).'
    ],
    pythonCode: `# Push-Relabel Algorithm
def push_relabel(capacity, s, t):
    n = len(capacity)
    flow = [[0] * n for _ in range(n)]
    height = [0] * n
    excess = [0] * n
    height[s] = n
    excess[s] = float('inf')
    for v in range(n):
        if capacity[s][v] > 0:
            pushed = capacity[s][v]
            flow[s][v] = pushed
            flow[v][s] = -pushed
            excess[v] = pushed
            excess[s] -= pushed
    for _ in range(n * 2):
        for u in range(n):
            if u != s and u != t and excess[u] > 0:
                for v in range(n):
                    if capacity[u][v] - flow[u][v] > 0 and height[u] == height[v] + 1:
                        send = min(excess[u], capacity[u][v] - flow[u][v])
                        flow[u][v] += send
                        flow[v][u] -= send
                        excess[u] -= send
                        excess[v] += send
    return excess[t]

caps = [[0, 10, 5], [0, 0, 10], [0, 0, 0]]
print("Max flow:", push_relabel(caps, 0, 2))
`
  }
];
