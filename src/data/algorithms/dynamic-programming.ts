import type { AlgorithmData } from './types';

export const dynamicProgrammingAlgorithms: AlgorithmData[] = [
  {
    id: '01-knapsack',
    name: '0/1 Knapsack Algorithm',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(N · W)', space: 'O(W)' },
    explanation: 'Given items with weights and values, determines the maximum value that can fit into a knapsack of capacity W where each item can either be taken or left behind.',
    realWorldExample: 'A burglar packing a backpack with limited weight capacity, choosing which precious jewelry items to steal for maximum total cash value.',
    stepByStepLogic: [
      '1. Allocate 1D array dp of size W + 1 initialized to 0.',
      '2. For each item (weight, value):',
      '3. Iterate capacity w backwards from W down to weight.',
      '4. Update dp[w] = max(dp[w], dp[w - weight] + value).',
      '5. Return dp[W].'
    ],
    pythonCode: `# 0/1 Knapsack
def knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for w, v in zip(weights, values):
        for cap in range(capacity, w - 1, -1):
            dp[cap] = max(dp[cap], dp[cap - w] + v)
    return dp[capacity]

wts = [1, 3, 4, 5]
vals = [1, 4, 5, 7]
print("Max value:", knapsack(wts, vals, 7))
`
  },
  {
    id: 'unbounded-knapsack',
    name: 'Unbounded Knapsack',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(N · W)', space: 'O(W)' },
    explanation: 'A variation of the knapsack problem where an unlimited number of copies of each item is available to fill the knapsack capacity.',
    realWorldExample: 'A store clerk cutting standard length copper pipe into custom retail segments to maximize revenue with infinite raw stock.',
    stepByStepLogic: [
      '1. Create dp array of size W + 1 initialized to 0.',
      '2. For w from 1 to W:',
      '3. For each item with weight wt and value val:',
      '4. If wt <= w: dp[w] = max(dp[w], dp[w - wt] + val).',
      '5. Return dp[W].'
    ],
    pythonCode: `# Unbounded Knapsack
def unbounded_knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for w in range(1, capacity + 1):
        for wt, val in zip(weights, values):
            if wt <= w:
                dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[capacity]

wts = [1, 3, 4]
vals = [10, 40, 50]
print("Max value:", unbounded_knapsack(wts, vals, 8))
`
  },
  {
    id: 'longest-common-subsequence',
    name: 'Longest Common Subsequence (LCS)',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(M · N)', space: 'O(M · N)' },
    explanation: 'Finds the longest subsequence present in both strings in the same relative order (not necessarily contiguous) using a 2D table.',
    realWorldExample: 'Comparing two versions of a software source file (like git diff) to identify common lines of code that remained untouched.',
    stepByStepLogic: [
      '1. Create 2D table dp of size (m + 1) x (n + 1).',
      '2. If s1[i - 1] == s2[j - 1]: dp[i][j] = dp[i - 1][j - 1] + 1.',
      '3. Else: dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]).',
      '4. Return dp[m][n].'
    ],
    pythonCode: `# Longest Common Subsequence
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]

print("LCS length:", lcs("AGGTAB", "GXTXAYB"))
`
  },
  {
    id: 'longest-increasing-subsequence',
    name: 'Longest Increasing Subsequence (LIS)',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(N log N)', space: 'O(N)' },
    explanation: 'Finds the length of the longest subsequence in which elements are in strictly increasing order, optimized with patience sorting and binary search.',
    realWorldExample: 'Tracking economic growth indicators to find the longest sequence of years where annual GDP strictly grew.',
    stepByStepLogic: [
      '1. Maintain an array tails where tails[i] stores smallest tail of all increasing subsequences of length i + 1.',
      '2. For each number x: use binary search (bisect_left) to find insertion index in tails.',
      '3. If x is greater than all tails, append x.',
      '4. Otherwise, replace existing entry with x.',
      '5. Length of tails is the LIS length.'
    ],
    pythonCode: `# Longest Increasing Subsequence (O(N log N))
import bisect

def length_of_lis(nums):
    tails = []
    for x in nums:
        idx = bisect.bisect_left(tails, x)
        if idx == len(tails):
            tails.append(x)
        else:
            tails[idx] = x
    return len(tails)

sequence = [10, 9, 2, 5, 3, 7, 101, 18]
print("LIS length:", length_of_lis(sequence))
`
  },
  {
    id: 'matrix-chain-multiplication',
    name: 'Matrix Chain Multiplication (MCM)',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(N³)', space: 'O(N²)' },
    explanation: 'Finds the optimal parenthesization of a chain of matrices that minimizes total scalar multiplications required.',
    realWorldExample: 'Arranging parentheses in (A × B) × C vs A × (B × C) to minimize the computation cost in 3D graphics rendering engines.',
    stepByStepLogic: [
      '1. Let m[i][j] be minimum multiplications for matrix chain from i to j.',
      '2. Set m[i][i] = 0 for all i.',
      '3. For chain length L from 2 to n:',
      '4. For i from 1 to n - L + 1 and j = i + L - 1:',
      '5. Try all split points k between i and j - 1 to find min cost: m[i][k] + m[k + 1][j] + p[i - 1]*p[k]*p[j].'
    ],
    pythonCode: `# Matrix Chain Multiplication
def matrix_chain_order(p):
    n = len(p) - 1
    m = [[0] * (n + 1) for _ in range(n + 1)]
    for length in range(2, n + 1):
        for i in range(1, n - length + 2):
            j = i + length - 1
            m[i][j] = float('inf')
            for k in range(i, j):
                cost = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j]
                if cost < m[i][j]:
                    m[i][j] = cost
    return m[1][n]

dims = [1, 2, 3, 4] # Matrices: 1x2, 2x3, 3x4
print("Min Multiplications:", matrix_chain_order(dims))
`
  },
  {
    id: 'edit-distance',
    name: 'Edit Distance (Levenshtein Distance)',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(M · N)', space: 'O(M · N)' },
    explanation: 'Calculates the minimum number of single-character edits (insertions, deletions, or substitutions) needed to convert one string into another.',
    realWorldExample: 'A spellchecker suggesting "kitten" when you accidentally mistype "sitting" by counting how few keystroke corrections are needed.',
    stepByStepLogic: [
      '1. Initialize (m + 1) x (n + 1) matrix dp where dp[i][0] = i and dp[0][j] = j.',
      '2. If word1[i - 1] == word2[j - 1], dp[i][j] = dp[i - 1][j - 1].',
      '3. Else dp[i][j] = 1 + min(insert: dp[i][j - 1], delete: dp[i - 1][j], replace: dp[i - 1][j - 1]).',
      '4. Return dp[m][n].'
    ],
    pythonCode: `# Edit Distance (Levenshtein)
def min_distance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i
    for j in range(n + 1): dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]

print("Edit Distance:", min_distance("horse", "ros"))
`
  },
  {
    id: 'coin-change',
    name: 'Coin Change Algorithm',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(Amount · N)', space: 'O(Amount)' },
    explanation: 'Computes the minimum number of coins needed to make up a given target amount using coins of specified denominations.',
    realWorldExample: 'A vending machine dispensing exact change using the fewest possible coins to avoid emptying its coin hopper.',
    stepByStepLogic: [
      '1. Create dp array of size amount + 1 initialized to infinity, with dp[0] = 0.',
      '2. For each coin denomination:',
      '3. For x from coin to amount: dp[x] = min(dp[x], dp[x - coin] + 1).',
      '4. Return dp[amount] if not infinity, else -1.'
    ],
    pythonCode: `# Coin Change (Fewest Coins)
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, amount + 1):
            dp[x] = min(dp[x], dp[x - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

print("Fewest coins for 11:", coin_change([1, 2, 5], 11))
`
  },
  {
    id: 'subset-sum',
    name: 'Subset Sum Algorithm',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(N · Target)', space: 'O(Target)' },
    explanation: 'Determines if there is a subset of non-negative integers whose elements sum up exactly to a given target number.',
    realWorldExample: 'Splitting a restaurant bill between friends where you need to check if any group of menu items adds up exactly to a $50 gift card balance.',
    stepByStepLogic: [
      '1. Allocate boolean array dp of size target + 1 initialized to False, with dp[0] = True.',
      '2. For each number num in array:',
      '3. For j from target down to num: dp[j] = dp[j] or dp[j - num].',
      '4. Return dp[target].'
    ],
    pythonCode: `# Subset Sum
def subset_sum(arr, target):
    dp = [False] * (target + 1)
    dp[0] = True
    for num in arr:
        for j in range(target, num - 1, -1):
            dp[j] = dp[j] or dp[j - num]
    return dp[target]

print("Subset sums to 9:", subset_sum([3, 34, 4, 12, 5, 2], 9))
`
  },
  {
    id: 'egg-dropping',
    name: 'Egg Dropping Algorithm',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(K · N²)', space: 'O(K · N)' },
    explanation: 'Determines the minimum number of trials needed in the worst case to identify the critical floor from which dropped eggs will break, given K eggs and N floors.',
    realWorldExample: 'Stress-testing phone screen drop resistance from various building heights to find the exact fracture floor threshold using minimal test phone samples.',
    stepByStepLogic: [
      '1. Base cases: 1 floor requires 1 trial; 1 egg requires N trials.',
      '2. For e eggs (2 to K) and f floors (2 to N):',
      '3. Try dropping from every floor x from 1 to f.',
      '4. If egg breaks: test remaining e - 1 eggs on x - 1 floors. If egg survives: test e eggs on f - x floors.',
      '5. dp[e][f] = 1 + min(max(break, survive)).'
    ],
    pythonCode: `# Egg Dropping Problem
def egg_drop(k, n):
    dp = [[0] * (n + 1) for _ in range(k + 1)]
    for i in range(1, k + 1):
        dp[i][1] = 1
        dp[i][0] = 0
    for j in range(1, n + 1):
        dp[1][j] = j
    for e in range(2, k + 1):
        for f in range(2, n + 1):
            dp[e][f] = float('inf')
            for x in range(1, f + 1):
                res = 1 + max(dp[e - 1][x - 1], dp[e][f - x])
                dp[e][f] = min(dp[e][f], res)
    return dp[k][n]

print("Min attempts with 2 eggs, 10 floors:", egg_drop(2, 10))
`
  },
  {
    id: 'rod-cutting',
    name: 'Rod Cutting Algorithm',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(N²)', space: 'O(N)' },
    explanation: 'Finds the maximum revenue obtainable by cutting a rod of length N into smaller pieces and selling each piece according to a price table.',
    realWorldExample: 'A timber mill deciding how to cut a 10-foot log into 2-foot, 3-foot, and 5-foot planks to maximize retail profit based on market lumber prices.',
    stepByStepLogic: [
      '1. Create dp array of size n + 1 initialized to 0.',
      '2. For length i from 1 to n:',
      '3. In an inner loop, check each possible first cut j from 1 to i: max_val = max(max_val, price[j - 1] + dp[i - j]).',
      '4. Set dp[i] = max_val.',
      '5. Return dp[n].'
    ],
    pythonCode: `# Rod Cutting
def cut_rod(prices, n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        max_val = -1
        for j in range(1, i + 1):
            max_val = max(max_val, prices[j - 1] + dp[i - j])
        dp[i] = max_val
    return dp[n]

price_list = [1, 5, 8, 9, 10, 17, 17, 20]
print("Max Revenue:", cut_rod(price_list, 8))
`
  },
  {
    id: 'palindrome-partitioning',
    name: 'Palindrome Partitioning',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(N²)', space: 'O(N²)' },
    explanation: 'Computes the minimum number of cuts needed to partition a string such that every resulting substring is a palindrome.',
    realWorldExample: 'Cutting a printed ribbon into the minimum number of pieces so that the text on each individual scrap reads identically forward and backward.',
    stepByStepLogic: [
      '1. Precompute is_pal[i][j] table indicating if substring s[i...j] is a palindrome.',
      '2. Let cuts[i] be minimum cuts for prefix s[0...i].',
      '3. For i from 0 to n - 1: if is_pal[0][i], cuts[i] = 0.',
      '4. Else cuts[i] = min(cuts[j] + 1) for all j where is_pal[j + 1][i] is True.',
      '5. Return cuts[n - 1].'
    ],
    pythonCode: `# Palindrome Partitioning (Min Cuts)
def min_cut(s):
    n = len(s)
    is_pal = [[False] * n for _ in range(n)]
    for i in range(n): is_pal[i][i] = True
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if length == 2: is_pal[i][j] = (s[i] == s[j])
            else: is_pal[i][j] = (s[i] == s[j] and is_pal[i + 1][j - 1])
    cuts = [0] * n
    for i in range(n):
        if is_pal[0][i]: cuts[i] = 0
        else:
            cuts[i] = min(cuts[j] + 1 for j in range(i) if is_pal[j + 1][i])
    return cuts[n - 1]

print("Min cuts for 'aab':", min_cut("aab"))
`
  },
  {
    id: 'traveling-salesperson-dp',
    name: 'Traveling Salesperson Problem (TSP)',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(N² · 2^N)', space: 'O(N · 2^N)' },
    explanation: 'Finds the minimum cost Hamiltonian cycle visiting every city exactly once using Held-Karp dynamic programming with bitmasks to represent visited city subsets.',
    realWorldExample: 'A traveling repair technician scheduling visits to 15 service clients around the city to minimize total daily gasoline consumption before returning home.',
    stepByStepLogic: [
      '1. Use bitmask to represent subset of visited cities.',
      '2. Base state: dp[1 << u][u] = dist[0][u] for each initial destination.',
      '3. For each mask and ending city u:',
      '4. Transition to next unvisited city v: dp[mask | (1 << v)][v] = min(dp[mask | (1 << v)][v], dp[mask][u] + dist[u][v]).',
      '5. Add return edge cost from final city back to 0.'
    ],
    pythonCode: `# Traveling Salesperson (Held-Karp DP with Bitmask)
def tsp(dist):
    n = len(dist)
    memo = {}
    def solve(mask, u):
        if mask == (1 << n) - 1:
            return dist[u][0]
        if (mask, u) in memo:
            return memo[(mask, u)]
        ans = float('inf')
        for v in range(n):
            if not (mask & (1 << v)):
                ans = min(ans, dist[u][v] + solve(mask | (1 << v), v))
        memo[(mask, u)] = ans
        return ans
    return solve(1, 0)

dist_matrix = [
    [0, 10, 15, 20],
    [10, 0, 35, 25],
    [15, 35, 0, 30],
    [20, 25, 30, 0]
]
print("Min Tour Cost:", tsp(dist_matrix))
`
  },
  {
    id: 'digit-dp',
    name: 'Digit DP',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(NumDigits · Sum · Constraints)', space: 'O(NumDigits · Sum)' },
    explanation: 'A technique for counting integers in a range [A, B] satisfying digit properties by constructing digits left-to-right with tight and leading-zero constraints.',
    realWorldExample: 'Counting how many odometer readings between 1,000 and 50,000 have digits that sum to an even number.',
    stepByStepLogic: [
      '1. Convert number bound into a string/array of digits.',
      '2. State parameters: (index, sum_so_far, is_tight, is_leading_zero).',
      '3. If is_tight: valid digits are 0 to digit[index]; else 0 to 9.',
      '4. Transition to next index with updated sum and tight flag.',
      '5. Memoize states that are not tight.'
    ],
    pythonCode: `# Digit DP: Count integers up to N whose digits sum to S
def count_with_digit_sum(n_str, target_sum):
    memo = {}
    def dp(idx, cur_sum, is_tight):
        if idx == len(n_str):
            return 1 if cur_sum == target_sum else 0
        state = (idx, cur_sum, is_tight)
        if state in memo:
            return memo[state]
        limit = int(n_str[idx]) if is_tight else 9
        total = 0
        for digit in range(limit + 1):
            total += dp(idx + 1, cur_sum + digit, is_tight and (digit == limit))
        memo[state] = total
        return total
    return dp(0, 0, True)

print("Integers <= 100 with digit sum 5:", count_with_digit_sum("100", 5))
`
  },
  {
    id: 'dp-on-trees',
    name: 'DP on Trees',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(N)', space: 'O(N)' },
    explanation: 'Computes optimal subtree answers recursively using post-order tree traversals (e.g. Maximum Weight Independent Set on trees).',
    realWorldExample: 'A company deciding which employees to invite to an annual gala: you can invite an employee or their manager, but never both to the same party.',
    stepByStepLogic: [
      '1. Define states per node: dp[u][0] (excluding node u) and dp[u][1] (including node u).',
      '2. Recurse into all children v of u.',
      '3. dp[u][0] = sum(max(dp[v][0], dp[v][1])) for all children.',
      '4. dp[u][1] = weight[u] + sum(dp[v][0]) for all children.',
      '5. Return max(dp[root][0], dp[root][1]).'
    ],
    pythonCode: `# DP on Trees: Maximum Weight Independent Set
def max_independent_set(adj, weights, root=0):
    dp = [[0, 0] for _ in range(len(weights))]
    def dfs(u, p):
        dp[u][1] = weights[u]
        dp[u][0] = 0
        for v in adj.get(u, []):
            if v != p:
                dfs(v, u)
                dp[u][0] += max(dp[v][0], dp[v][1])
                dp[u][1] += dp[v][0]
    dfs(root, -1)
    return max(dp[root][0], dp[root][1])

tree = {0: [1, 2], 1: [0], 2: [0]}
w = [10, 5, 6]
print("Max Independent Set Weight:", max_independent_set(tree, w))
`
  },
  {
    id: 'convex-hull-trick',
    name: 'Convex Hull Trick',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(N log N) or O(N)', space: 'O(N)' },
    explanation: 'A geometric DP optimization that maintains the upper or lower envelope of linear functions (lines: y = m*x + c) to query max/min values in O(log N) or O(1) time.',
    realWorldExample: 'Choosing the cheapest shipping subscription service where each carrier has a different base fee and per-pound delivery rate.',
    stepByStepLogic: [
      '1. When adding a line y = m*x + c, check intersection with the previous line on the envelope.',
      '2. If the new line renders the previous line redundant, pop it from the convex hull deque.',
      '3. For query x: binary search (or use pointer if x is monotonic) on line segments in the envelope.'
    ],
    pythonCode: `# Convex Hull Trick (Simple Line Container)
class Line:
    def __init__(self, m, c):
        self.m = m
        self.c = c
    def eval(self, x):
        return self.m * x + self.c

lines = [Line(-2, 10), Line(-1, 5), Line(0, 2)]
x_query = 3
print("Min value at x=3:", min(line.eval(x_query) for line in lines))
`
  },
  {
    id: 'knuth-optimization',
    name: 'Knuth Optimization',
    category: 'Dynamic Programming (DP) Algorithms',
    complexity: { time: 'O(N²)', space: 'O(N²)' },
    explanation: 'Reduces DP transitions of the form dp[i][j] = min(dp[i][k] + dp[k][j]) + cost from O(N³) to O(N²) when optimal split points satisfy opt[i][j - 1] <= opt[i][j] <= opt[i + 1][j].',
    realWorldExample: 'Slicing a long sheet of glass into custom customer panes where the optimal cut location between boundaries shifts monotonically.',
    stepByStepLogic: [
      '1. Verify the cost function satisfies the quadrangle inequality.',
      '2. Maintain opt[i][j] matrix alongside dp[i][j].',
      '3. Restrict search range for split k to [opt[i][j - 1], opt[i + 1][j]].',
      '4. Total loop operations across all states collapse to O(N²).'
    ],
    pythonCode: `# Knuth Optimization for Optimal Subproblem Splits
def knuth_dp(n):
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    opt = [[0] * (n + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        opt[i][i] = i
    return "Knuth DP initialized in O(N^2)"

print(knuth_dp(5))
`
  }
];
