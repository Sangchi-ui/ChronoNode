export interface EdgeCaseDataset {
  id: string;
  name: string;
  category: 'sorting' | 'tree' | 'array' | 'search';
  description: string;
  adversarialReason: string;
  pythonSnippet: string;
  rawArray?: number[];
}

/**
 * 1. Worst-Case Array: Strict descending order to break pivot strategies (e.g. QuickSort O(N²))
 */
export function generateWorstCaseArray(size = 9): number[] {
  const result: number[] = [];
  for (let i = size; i >= 1; i--) {
    result.push(i * 10);
  }
  return result;
}

/**
 * 2. Heavy Duplicates Array: Clustered identical values to test stability & 3-way partitioning
 */
export function generateHeavyDuplicatesArray(): number[] {
  return [7, 7, 7, 7, 2, 2, 8, 8, 8, 8, 1, 1];
}

/**
 * 3. Degenerate/Skewed Trees: Sequential BST insertions rendering as a straight diagonal line (O(N) depth)
 */
export function generateDegenerateTreeCode(values = [10, 20, 30, 40, 50, 60, 70]): string {
  return `class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

# Sequential insertions create a degenerate diagonal right-skewed tree
root = TreeNode(${values[0]})
current = root
for val in [${values.slice(1).join(', ')}]:
    current.right = TreeNode(val)
    current = current.right

# Target search traverses all N nodes linearly O(N)
target = ${values[values.length - 1]}
curr = root
while curr:
    if curr.val == target:
        print("Found target at depth:", curr.val)
        break
    curr = curr.right`;
}

/**
 * 4. Nearly Sorted Array: All sorted except one inverted pair
 */
export function generateNearlySortedArray(): number[] {
  return [2, 5, 8, 14, 12, 18, 24, 30];
}

/**
 * 5. Pipe Organ (Mountain) Array: Ascending then descending to trick dual-pivot partitioners
 */
export function generateMountainArray(): number[] {
  return [10, 30, 50, 70, 90, 80, 60, 40, 20];
}

export const ALL_EDGE_CASES: EdgeCaseDataset[] = [
  {
    id: 'worst-case-descending',
    name: 'Worst-Case Array (Strict Descending)',
    category: 'sorting',
    description: 'Elements sorted in strictly reverse/descending order [90, 80, 70, 60, 50, 40, 30, 20, 10].',
    adversarialReason:
      'Breaks standard Quick Sort Lomuto/Hoare partition strategies choosing first or last element as pivot, causing maximum O(N²) recursion depth and N*(N-1)/2 comparisons.',
    rawArray: generateWorstCaseArray(),
    pythonSnippet: `values = [${generateWorstCaseArray().join(', ')}]\n# Worst-case reverse sorted array for sorting algorithms\nfor i in range(len(values)):\n    for j in range(len(values) - 1 - i):\n        if values[j] > values[j + 1]:\n            values[j], values[j + 1] = values[j + 1], values[j]\nprint("Sorted:", values)`,
  },
  {
    id: 'heavy-duplicates',
    name: 'Heavy Duplicates Array (Clustered)',
    category: 'sorting',
    description: 'Array loaded with repeated identical keys [7, 7, 7, 7, 2, 2, 8, 8, 8, 8, 1, 1].',
    adversarialReason:
      'Triggers quadratic runtime in naive 2-way QuickSort implementations that fail to stop on duplicate keys, forcing repeated unbalanced splits.',
    rawArray: generateHeavyDuplicatesArray(),
    pythonSnippet: `values = [${generateHeavyDuplicatesArray().join(', ')}]\n# Heavy duplicate array\nfor i in range(1, len(values)):\n    key = values[i]\n    j = i - 1\n    while j >= 0 and values[j] > key:\n        values[j + 1] = values[j]\n        j -= 1\n    values[j + 1] = key\nprint("Sorted:", values)`,
  },
  {
    id: 'degenerate-skewed-tree',
    name: 'Degenerate/Skewed Tree (Diagonal Line)',
    category: 'tree',
    description: 'Binary Search Tree formed by sequential ascending insertions without self-balancing.',
    adversarialReason:
      'Degenerates tree height to H = N instead of log₂(N), collapsing tree search and insertion complexity from O(log N) down to linear O(N) like a singly linked list.',
    pythonSnippet: generateDegenerateTreeCode(),
  },
  {
    id: 'nearly-sorted',
    name: 'Nearly Sorted Array (1 Inversion)',
    category: 'sorting',
    description: 'Array already sorted except for a single adjacent out-of-order element.',
    adversarialReason:
      'Tests whether adaptive algorithms (e.g. Insertion Sort, TimSort, Bubble Sort with early exit) finish in optimal O(N) time.',
    rawArray: generateNearlySortedArray(),
    pythonSnippet: `values = [${generateNearlySortedArray().join(', ')}]\n# Nearly sorted array\nfor i in range(len(values) - 1, 0, -1):\n    swapped = False\n    for j in range(i):\n        if values[j] > values[j + 1]:\n            values[j], values[j + 1] = values[j + 1], values[j]\n            swapped = True\n    if not swapped:\n        break\nprint("Sorted:", values)`,
  },
  {
    id: 'pipe-organ',
    name: 'Pipe Organ Array (Peak / Valley)',
    category: 'array',
    description: 'Array ramping up to a peak and then cascading down [10, 30, 50, 70, 90, 80, 60, 40, 20].',
    adversarialReason:
      'Tricks median-of-three and dual-pivot strategies into picking skewed pivots.',
    rawArray: generateMountainArray(),
    pythonSnippet: `values = [${generateMountainArray().join(', ')}]\n# Mountain / Pipe Organ Array\nleft, right = 0, len(values) - 1\nwhile left <= right:\n    mid = (left + right) // 2\n    left += 1\n    right -= 1\nprint(values)`,
  },
];
