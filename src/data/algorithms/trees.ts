import type { AlgorithmData } from './types';

export const treeAlgorithms: AlgorithmData[] = [
  {
    id: 'tree-traversals',
    name: 'Pre-order, In-order, Post-order Traversals',
    category: 'Tree Algorithms',
    complexity: { time: 'O(N)', space: 'O(H)' },
    explanation: 'Fundamental depth-first tree traversal orders: Pre-order (Root, Left, Right), In-order (Left, Root, Right), and Post-order (Left, Right, Root).',
    realWorldExample: 'Reading an outline: Pre-order is reading chapter titles first, In-order is linear alphabetical indexing in a BST, and Post-order is calculating directory disk usage from subfolders up.',
    stepByStepLogic: [
      '1. Pre-order: process node, traverse left subtree, traverse right subtree.',
      '2. In-order: traverse left subtree, process node, traverse right subtree.',
      '3. Post-order: traverse left subtree, traverse right subtree, process node.'
    ],
    pythonCode: `# Pre-order, In-order, Post-order Tree Traversals
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def preorder(root):
    return [root.val] + preorder(root.left) + preorder(root.right) if root else []

def inorder(root):
    return inorder(root.left) + [root.val] + inorder(root.right) if root else []

def postorder(root):
    return postorder(root.left) + postorder(root.right) + [root.val] if root else []

# Tree: 1 -> (2, 3)
tree = TreeNode(1, TreeNode(2), TreeNode(3))
print("Pre-order:", preorder(tree))
print("In-order:", inorder(tree))
print("Post-order:", postorder(tree))
`
  },
  {
    id: 'level-order-traversal',
    name: 'Level Order Traversal',
    category: 'Tree Algorithms',
    complexity: { time: 'O(N)', space: 'O(W)' },
    explanation: 'Breadth-first traversal of a tree that visits nodes level by level from root down to leaves using a FIFO queue.',
    realWorldExample: 'A family tree showing grandparents on the top tier, parents on the second tier, and children on the third tier.',
    stepByStepLogic: [
      '1. Push root to a queue.',
      '2. Loop while queue is not empty.',
      '3. Pop the front node, record its value, and enqueue its left and right children if present.',
      '4. Repeat until all levels are visited.'
    ],
    pythonCode: `# Level Order Traversal (BFS)
from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def level_order(root):
    if not root: return []
    q = deque([root])
    result = []
    while q:
        node = q.popleft()
        result.append(node.val)
        if node.left: q.append(node.left)
        if node.right: q.append(node.right)
    return result

tree = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3))
print("Level Order:", level_order(tree))
`
  },
  {
    id: 'morris-traversal',
    name: 'Morris Traversal',
    category: 'Tree Algorithms',
    complexity: { time: 'O(N)', space: 'O(1)' },
    explanation: 'Traverses a binary tree in In-order using constant auxiliary space O(1) by establishing temporary threaded links from in-order predecessors back to current nodes.',
    realWorldExample: 'Leaving a breadcrumb trail along a forest path and sweeping the breadcrumbs away on your return walk.',
    stepByStepLogic: [
      '1. Initialize cur = root.',
      '2. If cur has no left child, visit cur and move cur = cur.right.',
      '3. Else, find in-order predecessor (rightmost node in left subtree).',
      '4. If predecessor.right is None: set predecessor.right = cur and move cur = cur.left.',
      '5. Else: restore tree by setting predecessor.right = None, visit cur, and move cur = cur.right.'
    ],
    pythonCode: `# Morris In-Order Traversal
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def morris_traversal(root):
    cur = root
    res = []
    while cur:
        if not cur.left:
            res.append(cur.val)
            cur = cur.right
        else:
            pre = cur.left
            while pre.right and pre.right != cur:
                pre = pre.right
            if not pre.right:
                pre.right = cur
                cur = cur.left
            else:
                pre.right = None
                res.append(cur.val)
                cur = cur.right
    return res

tree = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(5))
print("Morris In-order:", morris_traversal(tree))
`
  },
  {
    id: 'avl-tree-rotations',
    name: 'AVL Tree Rotations',
    category: 'Tree Algorithms',
    complexity: { time: 'O(1) rotation / O(log N) search', space: 'O(log N)' },
    explanation: 'Self-balancing binary search tree operations that restore balance factor (-1, 0, 1) using Single Left, Single Right, Left-Right, or Right-Left rotations.',
    realWorldExample: 'Adjusting a playground seesaw with unbalanced weights by redistributing the pivot point to keep both sides level.',
    stepByStepLogic: [
      '1. Compute balance factor: height(left) - height(right).',
      '2. LL case (balance > 1 and key < left.key): perform Right Rotation.',
      '3. RR case (balance < -1 and key > right.key): perform Left Rotation.',
      '4. LR case (balance > 1 and key > left.key): Left Rotate left child, then Right Rotate root.',
      '5. RL case (balance < -1 and key < right.key): Right Rotate right child, then Left Rotate root.'
    ],
    pythonCode: `# AVL Tree Node & Right Rotation
class AVLNode:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.height = 1

def right_rotate(y):
    x = y.left
    t2 = x.right
    x.right = y
    y.left = t2
    y.height = 1 + max(height(y.left), height(y.right))
    x.height = 1 + max(height(x.left), height(x.right))
    return x

def height(node):
    return node.height if node else 0

root = AVLNode(30)
root.left = AVLNode(20)
root.left.left = AVLNode(10)
balanced = right_rotate(root)
print("New root after Right Rotation:", balanced.key)
`
  },
  {
    id: 'red-black-tree-rebalancing',
    name: 'Red-Black Tree Rebalancing',
    category: 'Tree Algorithms',
    complexity: { time: 'O(log N)', space: 'O(1)' },
    explanation: 'A self-balancing BST with node color properties (red/black) ensuring no path from root to leaf is more than twice as long as any other path via recoloring and tree rotations.',
    realWorldExample: 'A traffic light system regulating intersections so that no lane waits through two red lights while others proceed continuously.',
    stepByStepLogic: [
      '1. Every newly inserted node is colored Red.',
      '2. If uncle is Red: recolor parent and uncle Black, grandfather Red, and propagate up.',
      '3. If uncle is Black: perform tree rotations (Left/Right) and swap parent/grandfather colors.',
      '4. Root is always colored Black.'
    ],
    pythonCode: `# Red-Black Tree Colors & Properties
RED, BLACK = 'RED', 'BLACK'

class RBNode:
    def __init__(self, val, color=RED):
        self.val = val
        self.color = color
        self.left = None
        self.right = None
        self.parent = None

node = RBNode(10, BLACK)
print(f"Node: {node.val}, Color: {node.color}")
`
  },
  {
    id: 'splay-tree-splaying',
    name: 'Splay Tree Splaying',
    category: 'Tree Algorithms',
    complexity: { time: 'O(log N) amortized', space: 'O(1)' },
    explanation: 'A self-adjusting binary search tree where recently accessed elements are rotated (splayed) to the root using zig, zig-zig, and zig-zag rotation steps.',
    realWorldExample: 'Reorganizing tools on a workbench by putting the tool you just used right in front of you so you can grab it again immediately.',
    stepByStepLogic: [
      '1. Zig step: single rotation when parent is root.',
      '2. Zig-Zig step: double rotation in same direction when node and parent are both left/right children.',
      '3. Zig-Zag step: double rotation in alternating directions.',
      '4. Repeat until the target node is at the root.'
    ],
    pythonCode: `# Splay Tree Right Rotation (Zig Step)
class SplayNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def rotate_right(root):
    new_root = root.left
    root.left = new_root.right
    new_root.right = root
    return new_root

root = SplayNode(20)
root.left = SplayNode(10)
splayed = rotate_right(root)
print("Splayed Root:", splayed.val)
`
  },
  {
    id: 'segment-tree',
    name: 'Segment Tree Build/Update/Query',
    category: 'Tree Algorithms',
    complexity: { time: 'O(log N) query/update / O(N) build', space: 'O(N)' },
    explanation: 'A tree data structure for storing intervals or segments, allowing fast range queries (e.g. range sum, min, max) and point updates in logarithmic time.',
    realWorldExample: 'A sports tournament bracket where scores from sub-matches roll up into division champions, allowing you to instantly inspect any division score.',
    stepByStepLogic: [
      '1. Build tree array of size 4N recursively by combining child nodes (left child: 2i + 1, right child: 2i + 2).',
      '2. Query(qL, qR): if range completely overlaps, return node value; if disjoint, return identity; else combine child queries.',
      '3. Update(idx, val): traverse down to leaf, update value, and recompute parent nodes.'
    ],
    pythonCode: `# Segment Tree for Range Sum Queries
class SegmentTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self.build(arr, 0, 0, self.n - 1)

    def build(self, arr, node, start, end):
        if start == end:
            self.tree[node] = arr[start]
            return
        mid = (start + end) // 2
        self.build(arr, 2 * node + 1, start, mid)
        self.build(arr, 2 * node + 2, mid + 1, end)
        self.tree[node] = self.tree[2 * node + 1] + self.tree[2 * node + 2]

    def query(self, node, start, end, l, r):
        if r < start or end < l: return 0
        if l <= start and end <= r: return self.tree[node]
        mid = (start + end) // 2
        return self.query(2 * node + 1, start, mid, l, r) + self.query(2 * node + 2, mid + 1, end, l, r)

data = [1, 3, 5, 7, 9, 11]
st = SegmentTree(data)
print("Sum of [1, 3]:", st.query(0, 0, 5, 1, 3))
`
  },
  {
    id: 'lazy-propagation',
    name: 'Lazy Propagation',
    category: 'Tree Algorithms',
    complexity: { time: 'O(log N) range update & query', space: 'O(N)' },
    explanation: 'An optimization for segment trees that postpones range updates to child nodes until the children are actually queried, achieving O(log N) range updates.',
    realWorldExample: 'Leaving an "out of office" note on a manager\'s desk to notify team members of updates only when they come looking for work.',
    stepByStepLogic: [
      '1. Allocate a lazy[] array alongside the segment tree.',
      '2. Before querying or updating a node, push down any pending lazy value to its children.',
      '3. For a range update matching the segment: update node value and tag lazy flag for children.',
      '4. Return immediately without updating descendant leaves.'
    ],
    pythonCode: `# Segment Tree with Lazy Propagation
class LazySegmentTree:
    def __init__(self, n):
        self.n = n
        self.tree = [0] * (4 * n)
        self.lazy = [0] * (4 * n)

    def update_range(self, node, start, end, l, r, val):
        if self.lazy[node] != 0:
            self.tree[node] += (end - start + 1) * self.lazy[node]
            if start != end:
                self.lazy[2 * node + 1] += self.lazy[node]
                self.lazy[2 * node + 2] += self.lazy[node]
            self.lazy[node] = 0
        if start > end or start > r or end < l: return
        if start >= l and end <= r:
            self.tree[node] += (end - start + 1) * val
            if start != end:
                self.lazy[2 * node + 1] += val
                self.lazy[2 * node + 2] += val
            return
        mid = (start + end) // 2
        self.update_range(2 * node + 1, start, mid, l, r, val)
        self.update_range(2 * node + 2, mid + 1, end, l, r, val)
        self.tree[node] = self.tree[2 * node + 1] + self.tree[2 * node + 2]

lst = LazySegmentTree(6)
lst.update_range(0, 0, 5, 1, 4, 3)
print("Updated root with lazy updates:", lst.tree[0])
`
  },
  {
    id: 'fenwick-tree',
    name: 'Fenwick Tree (Binary Indexed Tree)',
    category: 'Tree Algorithms',
    complexity: { time: 'O(log N) update & query', space: 'O(N)' },
    explanation: 'A compact tree represented as a flat array that computes prefix sums and updates elements in O(log N) time using bitwise (i & -i) lowest set bit operations.',
    realWorldExample: 'A pocket calculator memory register tracking running balances using powers of two denominations.',
    stepByStepLogic: [
      '1. Initialize BIT array of size n + 1 with zeros.',
      '2. Query(i): sum tree[i] and jump up: i -= (i & -i) until i == 0.',
      '3. Update(i, val): add val to tree[i] and jump: i += (i & -i) until i > n.',
      '4. Range query [L, R] = query(R) - query(L - 1).'
    ],
    pythonCode: `# Fenwick Tree (Binary Indexed Tree)
class FenwickTree:
    def __init__(self, size):
        self.tree = [0] * (size + 1)

    def update(self, i, delta):
        while i < len(self.tree):
            self.tree[i] += delta
            i += (i & -i)

    def query(self, i):
        s = 0
        while i > 0:
            s += self.tree[i]
            i -= (i & -i)
        return s

bit = FenwickTree(5)
for idx, val in enumerate([2, 1, 1, 3, 2], start=1):
    bit.update(idx, val)
print("Prefix sum up to 4:", bit.query(4))
`
  },
  {
    id: 'lca-binary-lifting',
    name: 'Lowest Common Ancestor (LCA) - Binary Lifting',
    category: 'Tree Algorithms',
    complexity: { time: 'O(log N) query / O(N log N) prep', space: 'O(N log N)' },
    explanation: 'Precomputes 2^k ancestors (up[u][k]) for every node so that lowest common ancestor queries can be resolved in logarithmic time by lifting nodes upwards.',
    realWorldExample: 'Finding the closest shared manager between two corporate employees by jumping up organizational chart levels in powers of 2 (1, 2, 4, 8).',
    stepByStepLogic: [
      '1. Compute depths and 2^0 parent for all nodes using DFS.',
      '2. Precompute up[u][k] = up[up[u][k - 1]][k - 1] for powers of 2.',
      '3. For LCA(u, v): lift the deeper node so depth(u) == depth(v).',
      '4. If u == v, return u.',
      '5. Lift both nodes simultaneously for decreasing powers of 2 until parents match.'
    ],
    pythonCode: `# LCA using Binary Lifting
import math

class BinaryLiftingLCA:
    def __init__(self, n, adj, root=0):
        self.log = max(1, int(math.ceil(math.log2(n + 1))))
        self.up = [[0] * self.log for _ in range(n)]
        self.depth = [0] * n
        self.dfs(root, root, 0, adj)

    def dfs(self, u, p, d, adj):
        self.depth[u] = d
        self.up[u][0] = p
        for i in range(1, self.log):
            self.up[u][i] = self.up[self.up[u][i - 1]][i - 1]
        for v in adj.get(u, []):
            if v != p: self.dfs(v, u, d + 1, adj)

    def lca(self, u, v):
        if self.depth[u] < self.depth[v]: u, v = v, u
        for i in range(self.log - 1, -1, -1):
            if self.depth[u] - (1 << i) >= self.depth[v]:
                u = self.up[u][i]
        if u == v: return u
        for i in range(self.log - 1, -1, -1):
            if self.up[u][i] != self.up[v][i]:
                u = self.up[u][i]
                v = self.up[v][i]
        return self.up[u][0]

tree_adj = {0: [1, 2], 1: [0, 3, 4], 2: [0], 3: [1], 4: [1]}
lca_finder = BinaryLiftingLCA(5, tree_adj)
print("LCA(3, 4):", lca_finder.lca(3, 4))
`
  },
  {
    id: 'lca-euler-rmq',
    name: 'Lowest Common Ancestor - Euler Tour + RMQ',
    category: 'Tree Algorithms',
    complexity: { time: 'O(1) query / O(N log N) prep', space: 'O(N log N)' },
    explanation: 'Flattens the tree into an Euler tour traversal array and reduces the LCA query to a Range Minimum Query (RMQ) over node depths in constant O(1) time.',
    realWorldExample: 'A hiker walking around a mountain peak recording their altitude at every step; the lowest altitude point between visiting two camps is their connecting saddle pass.',
    stepByStepLogic: [
      '1. Record the Euler tour of the tree (visiting nodes and recording depth).',
      '2. Note the first occurrence index first[u] for each node.',
      '3. To query LCA(u, v): find min depth in the Euler tour between first[u] and first[v].',
      '4. Use a Sparse Table to resolve the range minimum in O(1) time.'
    ],
    pythonCode: `# LCA via Euler Tour + Range Minimum
def euler_tour(u, p, d, adj, tour, depths, first):
    first[u] = len(tour)
    tour.append(u)
    depths.append(d)
    for v in adj.get(u, []):
        if v != p:
            euler_tour(v, u, d + 1, adj, tour, depths, first)
            tour.append(u)
            depths.append(d)

adj = {0: [1, 2], 1: [0, 3], 2: [0], 3: [1]}
tour, depths, first = [], [], {}
euler_tour(0, -1, 0, adj, tour, depths, first)
print("Euler Tour:", tour)
`
  },
  {
    id: 'heavy-light-decomposition',
    name: 'Heavy-Light Decomposition (HLD)',
    category: 'Tree Algorithms',
    complexity: { time: 'O(log² N) query/update', space: 'O(N)' },
    explanation: 'Decomposes a tree into disjoint chains of "heavy" edges (pointing to the child with the largest subtree), allowing tree path queries to be executed across O(log N) segment tree ranges.',
    realWorldExample: 'A corporate railway line where main trunk lines connect the largest commercial cities, and small light rail spurs feed into regional stations.',
    stepByStepLogic: [
      '1. First DFS: compute subtree sizes and identify the heavy child for each node.',
      '2. Second DFS: decompose tree into heavy chains, assigning linear segment tree positions.',
      '3. For path queries (u, v): jump chain heads upward until both nodes share the same chain.',
      '4. Query segment tree ranges along each chain.'
    ],
    pythonCode: `# Heavy-Light Decomposition Subtree Sizing
def dfs_size(u, p, adj, sz, heavy):
    sz[u] = 1
    max_c_sz = 0
    for v in adj.get(u, []):
        if v != p:
            dfs_size(v, u, adj, sz, heavy)
            sz[u] += sz[v]
            if sz[v] > max_c_sz:
                max_c_sz = sz[v]
                heavy[u] = v

adj = {0: [1, 2], 1: [0, 3, 4], 2: [0], 3: [1], 4: [1]}
sz = [0] * 5
heavy = [-1] * 5
dfs_size(0, -1, adj, sz, heavy)
print("Heavy children:", heavy)
`
  },
  {
    id: 'centroid-decomposition',
    name: 'Centroid Decomposition',
    category: 'Tree Algorithms',
    complexity: { time: 'O(N log N)', space: 'O(N)' },
    explanation: 'A divide-and-conquer tree technique that recursively finds the centroid (a node whose removal leaves no component larger than N / 2) to build a centroid tree of depth O(log N).',
    realWorldExample: 'Finding the geographic centroid of a nation to build a central distribution hub, then repeating within each sub-territory.',
    stepByStepLogic: [
      '1. Compute subtree sizes for the current component.',
      '2. Traverse down children to find centroid node c where all child subtrees <= size / 2.',
      '3. Disconnect centroid c and recursively decompose the remaining subtrees.',
      '4. Connect decomposed centroids to form the Centroid Tree.'
    ],
    pythonCode: `# Centroid Finding
def get_centroid(u, p, n, adj, sz):
    for v in adj.get(u, []):
        if v != p and sz[v] > n // 2:
            return get_centroid(v, u, n, adj, sz)
    return u

def compute_sz(u, p, adj, sz):
    sz[u] = 1
    for v in adj.get(u, []):
        if v != p:
            compute_sz(v, u, adj, sz)
            sz[u] += sz[v]

adj = {0: [1, 2, 3], 1: [0], 2: [0], 3: [0, 4], 4: [3]}
sz = [0] * 5
compute_sz(0, -1, adj, sz)
print("Tree Centroid:", get_centroid(0, -1, 5, adj, sz))
`
  }
];
