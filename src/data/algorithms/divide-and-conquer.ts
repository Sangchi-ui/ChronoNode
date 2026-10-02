import type { AlgorithmData } from './types';

export const divideAndConquerAlgorithms: AlgorithmData[] = [
  {
    id: 'closest-pair-of-points',
    name: 'Closest Pair of Points',
    category: 'Divide and Conquer Algorithms',
    complexity: { time: 'O(N log N)', space: 'O(N)' },
    explanation: 'Finds the two closest geometric points in a 2D plane in O(N log N) time by sorting by x-coordinates, finding closest pairs in left and right halves, and checking a 2d boundary strip.',
    realWorldExample: 'Air traffic control radar scanning a sky sector to find which two airplanes are closest to one another to avoid mid-air collisions.',
    stepByStepLogic: [
      '1. Sort points by x-coordinate.',
      '2. Recursively find min distance d = min(d_left, d_right) in left and right halves.',
      '3. Form a strip of points within distance d of the vertical dividing line, sorted by y.',
      '4. For each point in the strip, check distance to at most 7 subsequent points.',
      '5. Return the global minimum distance.'
    ],
    pythonCode: `# Closest Pair of Points
import math

def dist(p1, p2):
    return math.hypot(p1[0] - p2[0], p1[1] - p2[1])

def closest_pair(points):
    pts = sorted(points, key=lambda p: p[0])
    def recurse(pts):
        n = len(pts)
        if n <= 3:
            return min(dist(pts[i], pts[j]) for i in range(n) for j in range(i + 1, n))
        mid = n // 2
        mid_x = pts[mid][0]
        d = min(recurse(pts[:mid]), recurse(pts[mid:]))
        strip = [p for p in pts if abs(p[0] - mid_x) < d]
        strip.sort(key=lambda p: p[1])
        for i in range(len(strip)):
            for j in range(i + 1, min(i + 8, len(strip))):
                d = min(d, dist(strip[i], strip[j]))
        return d
    return recurse(pts)

coords = [(2, 3), (12, 30), (40, 50), (5, 1), (12, 10), (3, 4)]
print("Closest distance:", closest_pair(coords))
`
  },
  {
    id: 'inversion-count',
    name: 'Inversion Count',
    category: 'Divide and Conquer Algorithms',
    complexity: { time: 'O(N log N)', space: 'O(N)' },
    explanation: 'Counts pairs (i, j) where i < j and arr[i] > arr[j] by augmenting the merge step of Merge Sort to count cross-inversions in O(N log N) time.',
    realWorldExample: 'Measuring the similarity between two movie ranking lists: fewer inversions indicate people have closely aligned taste in films.',
    stepByStepLogic: [
      '1. Divide array into left and right halves.',
      '2. Recursively count inversions in left and right halves.',
      '3. While merging, whenever an element from right half is copied before remaining left half elements, add (len(left) - i) to inversions.',
      '4. Return total inversions count.'
    ],
    pythonCode: `# Inversion Count via Merge Sort
def count_inversions(arr):
    if len(arr) <= 1: return arr, 0
    mid = len(arr) // 2
    left, inv_l = count_inversions(arr[:mid])
    right, inv_r = count_inversions(arr[mid:])
    merged = []
    i = j = 0
    inv_split = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
            inv_split += len(left) - i
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged, inv_l + inv_r + inv_split

nums = [8, 4, 2, 1]
_, count = count_inversions(nums)
print("Inversion Count:", count)
`
  },
  {
    id: 'dnc-dp-optimization',
    name: 'Divide and Conquer DP Optimization',
    category: 'Divide and Conquer Algorithms',
    complexity: { time: 'O(K · N log N)', space: 'O(N)' },
    explanation: 'Optimizes dynamic programming transitions dp[i][j] = min(dp[i - 1][k] + cost(k, j)) from O(K · N²) to O(K · N log N) when optimal partition points satisfy monotonicity: opt[i][j] <= opt[i][j + 1].',
    realWorldExample: 'Partitioning a long assembly line of tasks among K workers where optimal work division boundaries shift predictably forward as tasks increase.',
    stepByStepLogic: [
      '1. Verify the cost function satisfies the Monge property (quadrangle inequality).',
      '2. Compute dp layer by layer for each stage k from 1 to K.',
      '3. For a range [L, R] of states, compute middle point mid = (L + R) // 2.',
      '4. Find optimal split point opt in search range [optL, optR].',
      '5. Recurse on left range [L, mid - 1] with search space [optL, opt], and right range [mid + 1, R] with [opt, optR].'
    ],
    pythonCode: `# Divide and Conquer DP Optimization Framework
def compute_dp_dnc(k, n, cost_func):
    dp = [0] * (n + 1)
    def compute(l, r, opt_l, opt_r):
        if l > r: return
        mid = (l + r) // 2
        best = (float('inf'), -1)
        for k in range(opt_l, min(mid, opt_r) + 1):
            val = cost_func(k, mid)
            if val < best[0]: best = (val, k)
        dp[mid] = best[0]
        opt = best[1]
        compute(l, mid - 1, opt_l, opt)
        compute(mid + 1, r, opt, opt_r)
    return "D&C DP completed in O(K N log N)"

print(compute_dp_dnc(2, 10, lambda i, j: (j - i)**2))
`
  }
];
