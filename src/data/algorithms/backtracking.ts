import type { AlgorithmData } from './types';

export const backtrackingAlgorithms: AlgorithmData[] = [
  {
    id: 'n-queens',
    name: 'N-Queens Algorithm',
    category: 'Backtracking Algorithms',
    complexity: { time: 'O(N!)', space: 'O(N)' },
    explanation: 'Places N chess queens on an N×N chessboard so that no two queens threaten each other (none share the same row, column, or diagonal) via recursive backtracking.',
    realWorldExample: 'Placing security guards in an art gallery museum hall such that no guard\'s line-of-sight directly crosses any other guard\'s field of view.',
    stepByStepLogic: [
      '1. Place queens row by row starting at row 0.',
      '2. For current row, attempt placing a queen in column c from 0 to N - 1.',
      '3. Verify placement is safe (no conflicts in column, positive diagonal, or negative diagonal).',
      '4. If safe, place queen and recursively attempt placing in next row.',
      '5. If row placement leads to a dead end, backtrack by removing the queen.'
    ],
    pythonCode: `# N-Queens Problem
def solve_n_queens(n):
    cols, diag1, diag2 = set(), set(), set()
    board = []

    def backtrack(r):
        if r == n: return 1
        count = 0
        for c in range(n):
            if c in cols or (r - c) in diag1 or (r + c) in diag2:
                continue
            cols.add(c); diag1.add(r - c); diag2.add(r + c)
            count += backtrack(r + 1)
            cols.remove(c); diag1.remove(r - c); diag2.remove(r + c)
        return count

    return backtrack(0)

print("4-Queens solutions count:", solve_n_queens(4))
`
  },
  {
    id: 'sudoku-solver',
    name: 'Sudoku Solver',
    category: 'Backtracking Algorithms',
    complexity: { time: 'O(9^(EmptyCells))', space: 'O(1)' },
    explanation: 'Solves a 9x9 Sudoku puzzle by filling empty cells with valid digits (1 to 9) that satisfy row, column, and 3x3 box constraints, backtracking upon dead ends.',
    realWorldExample: 'Filling out a crossword puzzle in pencil: writing a tentative letter and erasing it back to the blank box if intersecting words become impossible.',
    stepByStepLogic: [
      '1. Scan board for the next empty cell (value 0). If none remain, puzzle is solved.',
      '2. Try placing digits 1 through 9.',
      '3. Check if digit is safe (not present in current row, column, or 3x3 subgrid).',
      '4. If safe, write digit and recurse on next empty cell.',
      '5. If recursive call fails, reset cell to 0 (backtrack) and try next digit.'
    ],
    pythonCode: `# Sudoku Solver
def solve_sudoku(grid):
    def is_valid(r, c, val):
        for i in range(9):
            if grid[r][i] == val or grid[i][c] == val: return False
            if grid[3 * (r // 3) + i // 3][3 * (c // 3) + i % 3] == val: return False
        return True

    def backtrack():
        for r in range(9):
            for c in range(9):
                if grid[r][c] == 0:
                    for val in range(1, 10):
                        if is_valid(r, c, val):
                            grid[r][c] = val
                            if backtrack(): return True
                            grid[r][c] = 0
                    return False
        return True
    backtrack()
    return grid

board = [[0]*9 for _ in range(9)]
board[0][0] = 5
solve_sudoku(board)
print("Solved cell (0, 1):", board[0][1])
`
  },
  {
    id: 'rat-in-a-maze',
    name: 'Rat in a Maze',
    category: 'Backtracking Algorithms',
    complexity: { time: 'O(4^(N²))', space: 'O(N²)' },
    explanation: 'Finds a valid path from the top-left cell to the bottom-right cell in an N×N grid with obstacles by exploring directions (Down, Left, Right, Up) and backtracking from dead ends.',
    realWorldExample: 'A laboratory mouse navigating through an experimental maze testing corridor openings, retreating whenever it bumps into a closed wall barrier.',
    stepByStepLogic: [
      '1. Start at cell (0, 0). Check if destination (n - 1, n - 1) is reached.',
      '2. Mark current cell as visited in path.',
      '3. Try moving in directions (Down, Left, Right, Up).',
      '4. Check if next step is inside bounds, unvisited, and not blocked.',
      '5. Recurse. If no direction succeeds, unmark current cell (backtrack).'
    ],
    pythonCode: `# Rat in a Maze
def solve_maze(maze):
    n = len(maze)
    path = []
    def backtrack(r, c, current_path):
        if r == n - 1 and c == n - 1:
            path.append(current_path)
            return
        maze[r][c] = 0
        for dr, dc, move in [(1, 0, 'D'), (0, 1, 'R')]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n and maze[nr][nc] == 1:
                backtrack(nr, nc, current_path + move)
        maze[r][c] = 1

    if maze[0][0] == 1:
        backtrack(0, 0, "")
    return path

grid = [
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 1]
]
print("Maze paths:", solve_maze(grid))
`
  },
  {
    id: 'hamiltonian-cycle',
    name: 'Hamiltonian Cycle Algorithm',
    category: 'Backtracking Algorithms',
    complexity: { time: 'O(N!)', space: 'O(N)' },
    explanation: 'Finds a closed loop path in a graph that visits every vertex exactly once and returns to the starting vertex.',
    realWorldExample: 'A postal delivery van visiting all neighborhood mailboxes in one continuous loop without visiting any street address twice, returning to the depot.',
    stepByStepLogic: [
      '1. Place vertex 0 as starting node in path array.',
      '2. Try adding vertex v from 1 to V - 1 to path.',
      '3. Verify v is adjacent to previous node and not already visited in path.',
      '4. If path length reaches V, check if an edge connects the last node back to vertex 0.',
      '5. Backtrack if vertex leads to no valid cycle.'
    ],
    pythonCode: `# Hamiltonian Cycle Detection
def hamiltonian_cycle(graph):
    n = len(graph)
    path = [-1] * n
    path[0] = 0

    def is_safe(v, pos):
        if graph[path[pos - 1]][v] == 0 or v in path:
            return False
        return True

    def backtrack(pos):
        if pos == n:
            return graph[path[pos - 1]][path[0]] == 1
        for v in range(1, n):
            if is_safe(v, pos):
                path[pos] = v
                if backtrack(pos + 1): return True
                path[pos] = -1
        return False

    return path if backtrack(1) else "No Hamiltonian cycle"

adj_mat = [
    [0, 1, 1, 1],
    [1, 0, 1, 0],
    [1, 1, 0, 1],
    [1, 0, 1, 0]
]
print("Hamiltonian Path:", hamiltonian_cycle(adj_mat))
`
  },
  {
    id: 'm-coloring',
    name: 'M-Coloring Algorithm',
    category: 'Backtracking Algorithms',
    complexity: { time: 'O(M^V)', space: 'O(V)' },
    explanation: 'Assigns one of M colors to every graph vertex such that no two adjacent vertices share the same color.',
    realWorldExample: 'Coloring geographic nations on a world map using at most 4 colors so that no two neighboring countries with a shared border have the same color.',
    stepByStepLogic: [
      '1. Assign colors vertex by vertex from 0 to V - 1.',
      '2. For current vertex, try assigning colors from 1 to M.',
      '3. Check if color is safe (none of its adjacent neighbors have the same color).',
      '4. If safe, assign color and recursively color next vertex.',
      '5. If no color works, backtrack and change previous vertex color.'
    ],
    pythonCode: `# M-Coloring Problem
def graph_coloring(adj, m):
    n = len(adj)
    colors = [0] * n

    def is_safe(node, color):
        return all(colors[nbr] != color for nbr in adj.get(node, []))

    def backtrack(node):
        if node == n: return True
        for c in range(1, m + 1):
            if is_safe(node, c):
                colors[node] = c
                if backtrack(node + 1): return True
                colors[node] = 0
        return False

    return colors if backtrack(0) else "Not possible"

g = {0: [1, 2], 1: [0, 2], 2: [0, 1]}
print("Node colors with 3 colors:", graph_coloring(g, 3))
`
  },
  {
    id: 'subset-generation',
    name: 'Subset Generation',
    category: 'Backtracking Algorithms',
    complexity: { time: 'O(2^N)', space: 'O(N)' },
    explanation: 'Generates all 2^N subsets (the power set) of a given set by making a binary decision at each element: either include it or exclude it.',
    realWorldExample: 'Choosing which optional pizza toppings to order from a list of N available toppings, yielding every conceivable topping combination.',
    stepByStepLogic: [
      '1. Maintain current subset list and current index.',
      '2. Base case: if index == len(nums), add copy of current subset to results.',
      '3. Recursive choice 1: include nums[index] and recurse to index + 1.',
      '4. Backtrack: remove nums[index].',
      '5. Recursive choice 2: exclude nums[index] and recurse to index + 1.'
    ],
    pythonCode: `# Subset Generation (Power Set)
def generate_subsets(nums):
    result = []
    subset = []
    def backtrack(idx):
        if idx == len(nums):
            result.append(list(subset))
            return
        # Include nums[idx]
        subset.append(nums[idx])
        backtrack(idx + 1)
        # Exclude nums[idx]
        subset.pop()
        backtrack(idx + 1)
    backtrack(0)
    return result

items = [1, 2, 3]
print("All subsets:", generate_subsets(items))
`
  },
  {
    id: 'permutation-generation',
    name: 'Permutation Generation',
    category: 'Backtracking Algorithms',
    complexity: { time: 'O(N!)', space: 'O(N)' },
    explanation: 'Generates all N! unique orderings of an array of distinct elements by swapping elements into each position and backtracking.',
    realWorldExample: 'Generating all possible podium finish arrangements (Gold, Silver, Bronze) for athletes in an Olympic final race.',
    stepByStepLogic: [
      '1. Start at index 0.',
      '2. If current index == len(arr), record current permutation copy.',
      '3. For i from current index to len(arr) - 1: swap arr[current] with arr[i].',
      '4. Recurse on current index + 1.',
      '5. Swap back arr[current] with arr[i] to backtrack.'
    ],
    pythonCode: `# Permutation Generation
def permute(arr):
    res = []
    def backtrack(start):
        if start == len(arr):
            res.append(list(arr))
            return
        for i in range(start, len(arr)):
            arr[start], arr[i] = arr[i], arr[start]
            backtrack(start + 1)
            arr[start], arr[i] = arr[i], arr[start]
    backtrack(0)
    return res

print("Permutations of [1, 2]:", permute([1, 2]))
`
  }
];
