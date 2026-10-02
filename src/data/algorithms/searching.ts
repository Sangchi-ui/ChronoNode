import type { AlgorithmData } from './types';

export const searchingAlgorithms: AlgorithmData[] = [
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'Searching Algorithms',
    complexity: {
      time: 'O(N)',
      space: 'O(1)',
      best: 'O(1)',
      average: 'O(N)',
      worst: 'O(N)',
      breakdownExplanation:
        'Linear Search inspects elements sequentially from index 0 to N-1. In the best-case scenario, the query target resides at index 0, requiring exactly 1 comparison (O(1)). In the worst-case scenario, the target is located at the final index (N-1) or is completely absent from the array, forcing the algorithm to evaluate all N elements before terminating (O(N)). Assuming a uniform probability distribution where any present element is equally likely to be at any index, the average comparison count is (N + 1) / 2, which asymptotically simplifies to O(N). Because the iterative search only maintains a single integer index pointer, the auxiliary space requirement is strictly constant at O(1).'
    },
    explanation:
      'A fundamental searching algorithm that sequentially traverses a collection from the beginning, examining each element one by one until a match is found or the collection is exhausted.',
    inDepthExplanation: `### Academic Definition & Conceptual Model
Linear Search (also known as Sequential Search) is the most fundamental searching paradigm in computer science. It operates on an unconstrained data model, requiring zero prior knowledge, structure, sorting, or invariants on the input collection. The algorithm establishes an index pointer at the 0th position and moves monotonically forward through contiguous memory, performing an equality comparison between the element at the current address and the target key.

### Intuition & The Exhaustive Verification Principle
In an unsorted collection of $N$ items, each item has an equal, independent probability of matching the search key. Because the elements lack a total ordering or indexing relation, inspecting element $A[i]$ provides zero mathematical entropy or information regarding the identity or value of element $A[i+1]$. Therefore, no subset of elements can ever be safely eliminated without direct inspection. The algorithm must verify candidates sequentially until either a match is encountered or the search domain is completely exhausted.

### When to Choose Linear Search Over Binary or Jump Search
While logarithmic algorithms dominate on sorted collections, Linear Search is the optimal and often only practical choice in specific engineering scenarios:
1. **Unsorted or Rapidly Mutating Data**: When data is continuously inserted, modified, or streamed, the computational cost of sorting the array ($O(N \\log N)$) vastly exceeds the overhead of performing occasional linear lookups ($O(N)$).
2. **Small Datasets ($N \\le 32$)**: For small collections, Linear Search consistently outperforms Binary Search in wall-clock time due to superior CPU L1/L2 cache prefetching and contiguous memory locality. Binary search introduces non-sequential memory jumps that cause CPU branch mispredictions and cache misses.
3. **Linked Lists & Sequential Streams**: In singly or doubly linked lists where $O(1)$ random indexing is impossible, sequential pointer traversal is mandatory.
4. **Hardware Buffers & File Streams**: When reading directly from non-seekable streams, standard input, or serial communication channels where backward traversal or arbitrary jumping is physically unsupported.`,
    realWorldExample:
      'Flipping through a stack of unsorted paper receipts or physical files on a desk one by one from top to bottom. Because the documents are not alphabetized or sorted by date, you cannot jump ahead with any certainty; you must inspect each page sequentially until you locate the invoice you need or exhaust the pile.',
    concreteWalkthrough: {
      inputExample: 'arr = [4, 9, 2, 7, 5, 8], target = 7',
      initialState: 'Pointer i = 0, Array Size N = 6, Target = 7',
      steps: [
        {
          step: 1,
          action: 'Inspect Index 0',
          state: 'arr[0] = 4 vs target = 7',
          explanation:
            'The pointer starts at index 0. The value arr[0] is 4. Since 4 != 7, no match occurs. Increment pointer to index 1.'
        },
        {
          step: 2,
          action: 'Inspect Index 1',
          state: 'arr[1] = 9 vs target = 7',
          explanation:
            'The pointer advances to index 1. The value arr[1] is 9. Since 9 != 7, no match occurs. Increment pointer to index 2.'
        },
        {
          step: 3,
          action: 'Inspect Index 2',
          state: 'arr[2] = 2 vs target = 7',
          explanation:
            'The pointer advances to index 2. The value arr[2] is 2. Since 2 != 7, no match occurs. Increment pointer to index 3.'
        },
        {
          step: 4,
          action: 'Inspect Index 3 (Match Found)',
          state: 'arr[3] = 7 vs target = 7',
          explanation:
            'The pointer advances to index 3. The value arr[3] is 7, which exactly matches target 7! The search halts immediately and returns index 3.'
        }
      ],
      finalState: 'Target 7 discovered at index 3 after exactly 4 sequential comparisons.',
      summary:
        'Linear Search verified elements at indices 0, 1, and 2 before finding the target at index 3, skipping the remaining 2 elements (indices 4 and 5) due to early exit.'
    },
    stepByStepLogic: [
      '1. Initialize pointer variable i = 0.',
      '2. While i < len(arr), retrieve current candidate value arr[i].',
      '3. Compare candidate against target: if arr[i] == target, terminate immediately and return index i.',
      '4. If arr[i] != target, increment pointer i = i + 1.',
      '5. If the loop concludes without finding a match (i == len(arr)), return -1 indicating failure.'
    ],
    edgeCases: [
      'Empty Input Array ([]): Loop condition i < len(arr) is immediately false (0 < 0); gracefully returns -1 in O(1) time without index errors.',
      'Single-Element Array ([x]): Loop runs exactly once. If arr[0] == target returns 0; otherwise exits loop and returns -1.',
      'Completely Missing Target (Target Not Found): Traverses every single element from 0 to N-1 before exiting loop and returning -1 (worst-case scenario).',
      'Duplicate Targets in Array: Always returns the index of the first occurrence from the left, making it inherently stable for first-match queries.',
      'Target at the Very First Slot (Index 0): Terminates on the first comparison (best-case O(1)).'
    ],
    applications: [
      'Searching unsorted in-memory arrays and dynamic lists in scripts and configuration parsers.',
      'Linear scanning across non-indexed database records or log files.',
      'Stream processing over TCP socket buffers and standard input.',
      'First-pass sentinel validation in low-level drivers and embedded firmware.'
    ],
    advantages: [
      'Requires zero preprocessing, auxiliary tables, or sorting overhead.',
      'Excels with hardware cache-line prefetching due to contiguous sequential memory access.',
      'Works seamlessly on linked lists and non-random-access data streams.'
    ],
    disadvantages: [
      'Linear asymptotic scale O(N) is prohibitively slow for large datasets (e.g. N > 100,000).',
      'Does not exploit any inherent ordering or structure present in sorted collections.'
    ],
    pythonCode: `# Linear Search Implementation
def linear_search(arr, target):
    """
    Sequentially inspects each index from 0 to N-1.
    Returns the index if target is found, otherwise -1.
    """
    n = len(arr)
    for i in range(n):
        # Compare current element with query target
        if arr[i] == target:
            return i  # Target match found
    return -1  # Target is absent

# Sample execution
values = [4, 9, 2, 7, 5, 8]
target = 7
result = linear_search(values, target)
print("Found at index:", result)
`
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching Algorithms',
    complexity: {
      time: 'O(log N)',
      space: 'O(1)',
      best: 'O(1)',
      average: 'O(log N)',
      worst: 'O(log N)',
      breakdownExplanation:
        'Binary Search operates on sorted arrays by repeatedly bisecting the candidate search space. In the best-case scenario, the initial midpoint calculated on the very first round matches the target key, taking O(1) time. In the average and worst cases, each step halves the remaining window: N, N/2, N/4, ..., 1. The maximum number of comparisons required to reduce the search window to length 1 is determined by the recurrence relation T(N) = T(N/2) + O(1), which solves to exactly ⌊log₂ N⌋ + 1, yielding strict O(log N) runtime. The iterative implementation uses constant auxiliary space O(1), tracking only three integer pointers (left, right, mid).'
    },
    explanation:
      'A divide-and-conquer search algorithm that repeatedly halves a sorted array to locate a target key in logarithmic time.',
    inDepthExplanation: `### Academic Definition & Conceptual Model
Binary Search is the canonical divide-and-conquer search algorithm designed for static, random-access sorted sequences. Given an array sorted in monotonic non-decreasing order ($A[0] \\le A[1] \\le \\dots \\le A[N-1]$), the algorithm maintains two inclusive boundary pointers, \`left\` and \`right\`. At each step, it probes the midpoint \`mid = left + (right - left) // 2\`. By comparing the midpoint value against the target, it discards an entire half of the search interval in $O(1)$ time.

### The Invariant of Bisection
The mathematical guarantee of Binary Search rests on the monotonic order invariant:
1. If $A[\\text{mid}] == \\text{target}$, the search terminates successfully.
2. If $A[\\text{mid}] < \\text{target}$, then because the array is sorted, every element at index $k \\le \\text{mid}$ must also be strictly less than the target ($A[k] \\le A[\\text{mid}] < \\text{target}$). Therefore, the entire left interval $[\\text{left} \\dots \\text{mid}]$ can be discarded by setting $\\text{left} = \\text{mid} + 1$.
3. If $A[\\text{mid}] > \\text{target}$, by symmetric reasoning, the entire right interval $[\\text{mid} \\dots \\text{right}]$ is discarded by setting $\\text{right} = \\text{mid} - 1$.

### When to Choose Binary Search Over Linear and Jump Search
- **Large Sorted Datasets ($N > 1,000$ to Millions)**: For an array of 1,000,000 elements, Linear Search requires up to 1,000,000 comparisons, and Jump Search requires ~2,000 comparisons. Binary Search guarantees isolation in at most 20 comparisons ($\\log_2 10^6 \\approx 19.93$).
- **Direct Random Access**: Binary Search requires $O(1)$ random indexing to jump directly to the calculated midpoint. (If random access is missing, such as in linked lists, Jump Search or Linear Search must be considered).
- **Optimization Problems ("Binary Search on Answer")**: Widely applied to monotonic decision problems—finding the minimal resource capacity, maximum throughput, or exact root of a mathematical function within a continuous or discrete range.`,
    realWorldExample:
      'Opening a 1,000-page dictionary right in the middle at page 500. If the word you are looking for begins with "M" and page 500 displays words beginning with "T", you instantly tear off and discard the entire second half (pages 501–1000). You then open the middle of the remaining front half at page 250, continually halving the pages until you land on the exact entry.',
    concreteWalkthrough: {
      inputExample: 'arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91, 105, 120], target = 91',
      initialState: 'left = 0, right = 11, Array Size N = 12, Target = 91',
      steps: [
        {
          step: 1,
          action: 'Calculate Initial Midpoint & Probe arr[5]',
          state: 'left = 0, right = 11, mid = 5, arr[5] = 23',
          explanation:
            'Compute mid = 0 + (11 - 0) // 2 = 5. arr[5] is 23. Compare 23 vs 91: since 23 < 91, the target must lie in the right subarray. Eliminate left half [0..5] by updating left = mid + 1 = 6.'
        },
        {
          step: 2,
          action: 'Bisect Right Subarray & Probe arr[8]',
          state: 'left = 6, right = 11, mid = 8, arr[8] = 72',
          explanation:
            'Compute mid = 6 + (11 - 6) // 2 = 8. arr[8] is 72. Compare 72 vs 91: since 72 < 91, the target is still to the right. Discard [6..8] by updating left = mid + 1 = 9.'
        },
        {
          step: 3,
          action: 'Bisect Narrowed Interval & Probe arr[10]',
          state: 'left = 9, right = 11, mid = 10, arr[10] = 105',
          explanation:
            'Compute mid = 9 + (11 - 9) // 2 = 10. arr[10] is 105. Compare 105 vs 91: since 105 > 91, target lies to the left. Discard [10..11] by setting right = mid - 1 = 9.'
        },
        {
          step: 4,
          action: 'Evaluate Final Converged Window & Isolate Target',
          state: 'left = 9, right = 9, mid = 9, arr[9] = 91',
          explanation:
            'Compute mid = 9 + (9 - 9) // 2 = 9. arr[9] is 91. Compare 91 vs 91: exact match located! Search terminates successfully returning index 9.'
        }
      ],
      finalState: 'Target 91 discovered at index 9 after exactly 4 bisection comparisons.',
      summary:
        'A candidate search space of 12 sorted elements was iteratively halved: 12 -> 6 -> 3 -> 1, isolating the target key in ⌊log₂ 12⌋ + 1 = 4 comparisons.'
    },
    stepByStepLogic: [
      '1. Initialize pointer left = 0 and pointer right = len(arr) - 1.',
      '2. While left <= right, calculate mid = left + (right - left) // 2 to avoid potential integer overflow.',
      '3. If arr[mid] == target, return mid immediately.',
      '4. If arr[mid] < target, shift search to the right partition by setting left = mid + 1.',
      '5. If arr[mid] > target, shift search to the left partition by setting right = mid - 1.',
      '6. If the while condition terminates (left > right), return -1 indicating the target is not present.'
    ],
    edgeCases: [
      'Empty Input Array ([]): left = 0 and right = -1; the loop condition left <= right is false immediately, returning -1 in O(1).',
      'Single-Element Array ([x]): left = 0, right = 0, mid = 0. Inspects arr[0] in 1 comparison; returns 0 if match, else returns -1.',
      'Duplicate Targets in Array: Standard binary search returns any valid matching index among duplicate keys, not necessarily the first occurrence.',
      'Completely Missing Target (Target Not Found): Left and right boundary pointers converge and cross over (left > right), cleanly returning -1.'
    ],
    applications: [
      'B-Tree and LSM-tree indexing lookups in database management systems (PostgreSQL, SQLite, MongoDB).',
      'Standard library search utilities: Python bisect, C++ std::lower_bound, Java Arrays.binarySearch.',
      'Binary search on answer for resource allocation, scheduling, and geometric bounds.',
      'Git bisect for pinpointing the exact commit that introduced a software regression.'
    ],
    advantages: [
      'Blazing fast logarithmic time complexity O(log N) that scales to billions of records effortlessly.',
      'Strict constant space overhead O(1) in the iterative form.',
      'Simple, elegant, and mathematically provable invariants.'
    ],
    disadvantages: [
      'Requires the data to be strictly sorted beforehand; sorting an unsorted array takes O(N log N).',
      'Requires constant-time random access O(1); inefficient or impossible on linked lists.'
    ],
    pythonCode: `# Binary Search (Iterative)
def binary_search(arr, target):
    """
    Searches for target in sorted array arr using bisection.
    Returns the index if target is found, otherwise -1.
    """
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        # Calculate midpoint avoiding overflow
        mid = left + (right - left) // 2
        
        # Check if target is at current midpoint
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            # Target is in the right half
            left = mid + 1
        else:
            # Target is in the left half
            right = mid - 1
            
    return -1  # Target is not present

# Sample execution
values = [2, 5, 8, 12, 16, 23, 38, 56, 72]
target = 23
result = binary_search(values, target)
print("Found at index:", result)
`
  },
  {
    id: 'ternary-search',
    name: 'Ternary Search',
    category: 'Searching Algorithms',
    complexity: {
      time: 'O(log3 N)',
      space: 'O(1)',
      best: 'O(1)',
      average: 'O(log3 N)',
      worst: 'O(log3 N)',
      breakdownExplanation:
        'Ternary Search divides the search space into three equal parts using two interior midpoints: mid1 = left + (right - left) // 3 and mid2 = right - (right - left) // 3. In the best case, either mid1 or mid2 matches the target on the first iteration (O(1)). In the average and worst cases, the search interval shrinks to 1/3 of its previous size at each round (recurrence T(N) = T(N/3) + 2). However, because two comparisons are required per round to test both midpoints, the total comparison count is 2 * log₃ N = 2 * (log₂ N / log₂ 3) ≈ 1.262 * log₂ N. While asymptotically logarithmic O(log N), it performs approximately 26% more comparisons on discrete arrays than Binary Search. The iterative implementation requires O(1) space.'
    },
    explanation:
      'Divides a sorted array into three equal parts using two midpoints (mid1 and mid2), eliminating two-thirds of candidates in each step.',
    inDepthExplanation: `### Academic Definition & Conceptual Model
Ternary Search is a divide-and-conquer algorithm that extends the bisection concept of Binary Search to trisection. Given a sorted array, it introduces two interior partition pivots, \\text{mid1} and \\text{mid2}, splitting the active window into three contiguous segments:
1. Left segment: $[\\text{left} \\dots \\text{mid1} - 1]$
2. Middle segment: $[\\text{mid1} + 1 \\dots \\text{mid2} - 1]$
3. Right segment: $[\\text{mid2} + 1 \\dots \\text{right}]$

### Comparison Against Binary Search: The Constant Factor Paradox
Students frequently assume that dividing a search space into 3 parts is faster than dividing it into 2. However, a rigorous algorithmic comparison reveals the opposite for discrete key lookups:
- Binary Search performs **1 comparison** per iteration and eliminates $\\frac{1}{2}$ of the remaining items:
  $$\\text{Comparisons}_{\\text{binary}} = 1 \\cdot \\log_2 N$$
- Ternary Search eliminates $\\frac{2}{3}$ of the items per iteration, but requires **2 comparisons** (evaluating both $A[\\text{mid1}]$ and $A[\\text{mid2}]$):
  $$\\text{Comparisons}_{\\text{ternary}} = 2 \\cdot \\log_3 N = 2 \\cdot \\frac{\\log_2 N}{\\log_2 3} \\approx 2 \\cdot 0.6309 \\cdot \\log_2 N \\approx 1.2618 \\cdot \\log_2 N$$
Therefore, Ternary Search performs **~26% more comparisons** than Binary Search on sorted arrays.

### True Engineering Domain: Unimodal Function Optimization
Ternary Search is fundamentally indispensable in **continuous numerical optimization**. When applied to a unimodal function (a function that strictly increases to a single global maximum and then strictly decreases, or vice versa), Ternary Search can locate the extreme point without requiring calculus, gradients, or derivatives by sampling two test coordinates in each interval.`,
    realWorldExample:
      'Locating a signal failure along a 90-kilometer fiber-optic cable by placing two testing rigs at the 30-km mark and the 60-km mark. By reading the signal levels at both test points simultaneously, engineers can isolate whether the break lies in the first 30 km, the middle 30 km, or the final 30 km, discarding two-thirds of the terrain in one sweep.',
    concreteWalkthrough: {
      inputExample: 'arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25], target = 19',
      initialState: 'left = 0, right = 12, N = 13, Target = 19',
      steps: [
        {
          step: 1,
          action: 'Trisect Interval & Probe mid1, mid2',
          state: 'left = 0, right = 12, mid1 = 4 (arr[4] = 9), mid2 = 8 (arr[8] = 17)',
          explanation:
            'Compute mid1 = 0 + (12 - 0) // 3 = 4 and mid2 = 12 - (12 - 0) // 3 = 8. Evaluate arr[4] = 9 and arr[8] = 17 against target 19. Since 19 > arr[mid2] (17), target lies strictly in the right third [9..12]. Discard left two thirds by setting left = mid2 + 1 = 9.'
        },
        {
          step: 2,
          action: 'Trisect Right Third [9..12]',
          state: 'left = 9, right = 12, mid1 = 10 (arr[10] = 21), mid2 = 11 (arr[11] = 23)',
          explanation:
            'Compute mid1 = 9 + (12 - 9) // 3 = 10 and mid2 = 12 - (12 - 9) // 3 = 11. arr[10] is 21, arr[11] is 23. Compare: since 19 < arr[mid1] (21), target lies in the sub-interval to the left of mid1. Discard [10..12] by setting right = mid1 - 1 = 9.'
        },
        {
          step: 3,
          action: 'Probe Converged Single Element [9..9]',
          state: 'left = 9, right = 9, mid1 = 9 (arr[9] = 19), mid2 = 9 (arr[9] = 19)',
          explanation:
            'Compute mid1 = 9, mid2 = 9. arr[9] is 19. Compare arr[mid1] vs target: 19 == 19. Exact target match confirmed!'
        },
        {
          step: 4,
          action: 'Final Verification & Return Index',
          state: 'Match confirmed at index 9',
          explanation:
            'Algorithm concludes successfully and returns index 9 after systematically trimming two thirds of the array in each iteration.'
        }
      ],
      finalState: 'Target 19 discovered at index 9 in 3 iterations.',
      summary:
        'Ternary Search placed dual probes into the sorted array, discarding the left two-thirds in Phase 1, the right two-thirds in Phase 2, and pinpointing the key in Phase 3.'
    },
    stepByStepLogic: [
      '1. Initialize boundaries left = 0 and right = len(arr) - 1.',
      '2. While left <= right, compute mid1 = left + (right - left) // 3 and mid2 = right - (right - left) // 3.',
      '3. If arr[mid1] == target, return mid1. If arr[mid2] == target, return mid2.',
      '4. If target < arr[mid1], the target is in the left third: set right = mid1 - 1.',
      '5. Else if target > arr[mid2], the target is in the right third: set left = mid2 + 1.',
      '6. Otherwise, the target is in the middle third: set left = mid1 + 1 and right = mid2 - 1.',
      '7. If left > right without finding a match, return -1.'
    ],
    edgeCases: [
      'Empty Input Array ([]): left = 0, right = -1. Loop terminates immediately, returning -1 in O(1).',
      'Single-Element Array ([x]): left = 0, right = 0. mid1 = 0, mid2 = 0. Evaluates arr[0] once and returns 0 if match, else -1.',
      'Two-Element Array ([x, y]): left = 0, right = 1. mid1 = 0, mid2 = 1. Evaluates both items in the first iteration.',
      'Duplicate Targets in Array: When duplicate keys span across pivot boundaries, either mid1 or mid2 may match, returning any valid duplicate index rather than the first.',
      'Completely Missing Target (Target Not Found): Subdivides range into thirds until left > right; cleanly returns -1.'
    ],
    applications: [
      'Finding the maximum or minimum of a unimodal continuous function in numerical analysis.',
      'Optimizing hyperparameters in machine learning where evaluation is expensive and non-differentiable.',
      'Computational geometry problems such as finding the minimum bounding box or closest point on convex curves.',
      'Algorithmic game theory and economic modeling for peak utility discovery.'
    ],
    advantages: [
      'Reduces search space to one-third per step (faster reduction factor than bisection).',
      'The premier algorithm for optimizing unimodal non-differentiable mathematical functions.',
      'O(1) auxiliary space overhead in the iterative version.'
    ],
    disadvantages: [
      'Performs more comparisons on discrete sorted arrays (~1.26x) than Binary Search due to dual-pivot evaluations.',
      'More complex control flow with multiple conditional branches.'
    ],
    pythonCode: `# Ternary Search (Iterative)
def ternary_search(arr, target):
    """
    Divides sorted array into 3 parts using mid1 and mid2.
    Returns index if found, else -1.
    """
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        # Compute the two partition midpoints
        mid1 = left + (right - left) // 3
        mid2 = right - (right - left) // 3
        
        # Check if target is at mid1 or mid2
        if arr[mid1] == target:
            return mid1
        if arr[mid2] == target:
            return mid2
            
        # Determine which third contains the target
        if target < arr[mid1]:
            # Target is in left third
            right = mid1 - 1
        elif target > arr[mid2]:
            # Target is in right third
            left = mid2 + 1
        else:
            # Target is in middle third
            left = mid1 + 1
            right = mid2 - 1
            
    return -1  # Target not found

# Sample execution
values = [1, 4, 7, 10, 15, 20, 25, 30]
target = 20
result = ternary_search(values, target)
print("Found at index:", result)
`
  },
  {
    id: 'jump-search',
    name: 'Jump Search',
    category: 'Searching Algorithms',
    complexity: {
      time: 'O(√N)',
      space: 'O(1)',
      best: 'O(1)',
      average: 'O(√N)',
      worst: 'O(√N)',
      breakdownExplanation:
        'Jump Search skips forward in blocks of fixed step size m = ⌊√N⌋. In the worst case, the algorithm makes N / m = N / √N = √N forward jumps to locate the target block, followed by at most (m - 1) = (√N - 1) backward linear comparisons inside that block. Total comparisons are (N / m) + m - 1 = 2√N - 1, which strictly resolves to O(√N). Best-case O(1) occurs when the very first examined element at index 0 matches the target. Space complexity is O(1) auxiliary as only scalar integers (step, prev, i) are stored.'
    },
    explanation:
      'Checks fewer elements in a sorted array by jumping ahead by fixed blocks of size √N, then performing linear search backwards inside the block.',
    inDepthExplanation: `### Academic Definition & Conceptual Model
Jump Search (also called Block Search) is an intermediate searching technique positioned between Linear Search ($O(N)$) and Binary Search ($O(\\log N)$). Designed for sorted collections, it traverses the data by skipping forward in fixed increments of size $m$. When it encounters an element whose value is greater than or equal to the target, it identifies the boundary block $[\\text{prev} \\dots \\min(\\text{step}, N)]$ and initiates a sequential linear search across that specific block.

### Mathematical Derivation of the Optimal Step Size (√N)
Why is the step size set to $\\sqrt{N}$? We can derive this mathematically:
Let $N$ be the total number of items and $m$ be the jump block size.
- In the worst case, the algorithm takes $N / m$ jumps forward to reach the block containing the target.
- Once within the candidate block of size $m$, the linear search requires at most $m - 1$ comparisons.
The total cost function is:
$$f(m) = \\frac{N}{m} + m - 1$$
To find the value of $m$ that minimizes this function, take the first derivative with respect to $m$ and set it to zero:
$$\\frac{df}{dm} = -\\frac{N}{m^2} + 1 = 0 \\implies m^2 = N \\implies m = \\sqrt{N}$$
Thus, an interval of $m = \\lfloor\\sqrt{N}\\rfloor$ is mathematically guaranteed to yield the minimum possible number of operations: $2\\sqrt{N} - 1 = O(\\sqrt{N})$.

### Why Choose Jump Search Over Binary Search?
1. **Unidirectional Forward Traversals**: Binary Search requires jumping backward and forward with equal ease. In hardware architectures such as magnetic tapes, sequential flash storage, or circular linked blocks, forward seeks are cheap but backward seeks are extremely slow. Jump Search jumps forward only and performs backward linear checks only once within a localized window.
2. **Predictable Linear Cache Locality**: Once the jump phase isolates the block, the subsequent linear search accesses contiguous memory addresses, maximizing CPU hardware cache hit rates.`,
    realWorldExample:
      'Skimming a massive 100-chapter encyclopedia volume by jumping forward 10 chapters at a time. When you reach chapter 40 and realize your topic (e.g., chapter 34) is behind you, you stop jumping forward and scan chapters 31, 32, 33, and 34 sequentially until you find the exact subject.',
    concreteWalkthrough: {
      inputExample: 'arr = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89], target = 55, N = 12',
      initialState: 'N = 12, step = int(sqrt(12)) = 3, prev = 0, Target = 55',
      steps: [
        {
          step: 1,
          action: 'First Jump to Index 2',
          state: 'probe index = min(3, 12) - 1 = 2, arr[2] = 1',
          explanation:
            'Check boundary of first block at index 2. arr[2] is 1. Since 1 < 55, target lies ahead. Update prev = 3, advance step = 3 + 3 = 6.'
        },
        {
          step: 2,
          action: 'Second Jump to Index 5',
          state: 'probe index = min(6, 12) - 1 = 5, arr[5] = 5',
          explanation:
            'Check boundary of second block at index 5. arr[5] is 5. Since 5 < 55, target lies ahead. Update prev = 6, advance step = 6 + 3 = 9.'
        },
        {
          step: 3,
          action: 'Third Jump to Index 8',
          state: 'probe index = min(9, 12) - 1 = 8, arr[8] = 21',
          explanation:
            'Check boundary of third block at index 8. arr[8] is 21. Since 21 < 55, target lies ahead. Update prev = 9, advance step = 9 + 3 = 12.'
        },
        {
          step: 4,
          action: 'Fourth Jump to Index 11 (Overshoot Detected)',
          state: 'probe index = min(12, 12) - 1 = 11, arr[11] = 89',
          explanation:
            'Check boundary of fourth block at index 11. arr[11] is 89. Since 89 >= 55, we have overshot the target! Target is confirmed to lie in block [prev=9 ... min(step, 12)=12].'
        },
        {
          step: 5,
          action: 'Linear Scan Inside Block [9..11]',
          state: 'i = 9: arr[9] = 34; i = 10: arr[10] = 55',
          explanation:
            'Begin linear scan at index 9: arr[9] is 34 != 55. Move to index 10: arr[10] is 55 == target! Match found at index 10.'
        }
      ],
      finalState: 'Target 55 identified at index 10 in 4 block jumps + 2 linear steps = 6 total operations.',
      summary:
        'Jump Search skipped past indices 0 through 8 in blocks of 3, then localized the exact item at index 10.'
    },
    stepByStepLogic: [
      '1. Calculate optimal jump step size: step = int(math.isqrt(len(arr))).',
      '2. Maintain pointer prev = 0.',
      '3. While step < len(arr) and arr[min(step, len(arr)) - 1] < target, update prev = step and increment step += int(math.isqrt(len(arr))).',
      '4. Once the target is bounded, initiate a linear search from index prev up to min(step, len(arr)).',
      '5. If arr[i] == target, return index i.',
      '6. If the linear search terminates without finding the target, return -1.'
    ],
    edgeCases: [
      'Empty Input Array ([]): Handled gracefully with early length check returning -1 in O(1).',
      'Single-Element Array ([x]): step = 1. Jump condition is false, linear loop inspects arr[0] and returns 0 if match, else -1.',
      'Duplicate Targets in Array: During the backward linear scan, returns the first matching duplicate index encountered within that block.',
      'Completely Missing Target (Target Not Found): Jumps either overshoot the array bounds or the backward linear search finishes without finding the target, cleanly returning -1.',
      'Arrays Where N is Not a Perfect Square: Using min(step, len(arr)) prevents out-of-bounds index errors on the final block.'
    ],
    applications: [
      'Low-level systems and storage devices where sequential forward seeks are substantially faster than random access or backward jumps.',
      'Medium-sized sorted arrays where binary search branch prediction overhead exceeds localized linear scans.',
      'Skip lists and block-indexed inverted indices in search engines.',
      'Embedded microcontrollers where square root lookup tables are precomputed.'
    ],
    advantages: [
      'Sublinear time complexity O(√N), substantially faster than linear search.',
      'Only requires jumping backwards once throughout the entire search procedure.',
      'Strictly constant O(1) auxiliary memory consumption.'
    ],
    disadvantages: [
      'Slower asymptotically than Binary Search (O(√N) vs O(log N)).',
      'Still requires the input collection to be sorted beforehand.'
    ],
    pythonCode: `# Jump Search Implementation
import math

def jump_search(arr, target):
    """
    Searches sorted array arr using block jumps of size sqrt(N).
    Pointers tracked: step, prev, probe, i
    Returns index if target is found, otherwise -1.
    """
    n = len(arr)
    if n == 0:
        return -1
        
    # Calculate optimal block jump size m = sqrt(N)
    block_size = int(math.isqrt(n))
    step = block_size
    prev = 0
    
    # Block jumping phase: probe block boundary
    while step < n:
        probe = min(step, n) - 1
        if arr[probe] >= target:
            break
        prev = step
        step += block_size
        
    # Linear search phase inside candidate block [prev ... min(step, n)]
    for i in range(prev, min(step, n)):
        if arr[i] == target:
            return i  # Target match located
            
    return -1  # Target is not present

# Sample execution
values = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
target = 55
result = jump_search(values, target)
print("Found at index:", result)
`
  },
  {
    id: 'interpolation-search',
    name: 'Interpolation Search',
    category: 'Searching Algorithms',
    complexity: { time: 'O(log log N) avg / O(N) worst', space: 'O(1)' },
    explanation: 'Estimates target position in uniformly distributed sorted data using linear interpolation formula: pos = low + ((target - arr[low]) * (high - low)) // (arr[high] - arr[low]).',
    realWorldExample: 'Looking up a name starting with "Z" in a phone directory by opening directly near the very back of the book rather than right in the center.',
    stepByStepLogic: [
      '1. Set low = 0 and high = len(arr) - 1.',
      '2. Calculate probe position based on target value relative to array endpoint values.',
      '3. Check if arr[pos] == target.',
      '4. If arr[pos] < target, adjust low = pos + 1.',
      '5. If arr[pos] > target, adjust high = pos - 1.',
      '6. Repeat while low <= high and target is within range [arr[low], arr[high]].'
    ],
    pythonCode: `# Interpolation Search
def interpolation_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high and arr[low] <= target <= arr[high]:
        if low == high:
            return low if arr[low] == target else -1
        pos = low + ((target - arr[low]) * (high - low)) // (arr[high] - arr[low])
        if arr[pos] == target:
            return pos
        elif arr[pos] < target:
            low = pos + 1
        else:
            high = pos - 1
    return -1

values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
result = interpolation_search(values, 70)
print("Found at index:", result)
`
  },
  {
    id: 'exponential-search',
    name: 'Exponential Search',
    category: 'Searching Algorithms',
    complexity: { time: 'O(log N)', space: 'O(1)' },
    explanation: 'Finds a search range by doubling indices (1, 2, 4, 8, ...) until arr[i] >= target, then executes binary search within the bounded window.',
    realWorldExample: 'Guessing a number in an unbounded game by checking powers of 2 (1, 2, 4, 8, 16...) until you exceed the mystery number, then zeroing in.',
    stepByStepLogic: [
      '1. Check if the first element (index 0) matches the target.',
      '2. Double the index bound: i = 1, then i *= 2 while i < n and arr[i] <= target.',
      '3. Bound the search range to [i // 2, min(i, n - 1)].',
      '4. Execute standard binary search within this bounded range.',
      '5. Return the target index or -1.'
    ],
    pythonCode: `# Exponential Search
def exponential_search(arr, target):
    if not arr:
        return -1
    if arr[0] == target:
        return 0
    n = len(arr)
    bound = 1
    while bound < n and arr[bound] <= target:
        bound *= 2
    left, right = bound // 2, min(bound, n - 1)
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

values = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30]
result = exponential_search(values, 18)
print("Found at index:", result)
`
  },
  {
    id: 'fibonacci-search',
    name: 'Fibonacci Search',
    category: 'Searching Algorithms',
    complexity: { time: 'O(log N)', space: 'O(1)' },
    explanation: 'Uses Fibonacci numbers to split a sorted array into unequally sized partitions using only addition and subtraction without division.',
    realWorldExample: 'Navigating chapters of a document using a natural golden-ratio bookmark spacing sequence rather than equal halves.',
    stepByStepLogic: [
      '1. Find the smallest Fibonacci number fibM >= len(arr). Keep fibMm1 and fibMm2.',
      '2. Calculate offset and probe index i = min(offset + fibMm2, n - 1).',
      '3. If arr[i] == target, return i.',
      '4. If arr[i] < target, shift Fibonacci sequence 1 step down and offset = i.',
      '5. If arr[i] > target, shift Fibonacci sequence 2 steps down.',
      '6. Repeat until the target is found or Fibonacci interval shrinks to 0.'
    ],
    pythonCode: `# Fibonacci Search
def fibonacci_search(arr, target):
    n = len(arr)
    fib_m2 = 0
    fib_m1 = 1
    fib_m = fib_m2 + fib_m1
    while fib_m < n:
        fib_m2 = fib_m1
        fib_m1 = fib_m
        fib_m = fib_m2 + fib_m1
    offset = -1
    while fib_m > 1:
        i = min(offset + fib_m2, n - 1)
        if arr[i] < target:
            fib_m = fib_m1
            fib_m1 = fib_m2
            fib_m2 = fib_m - fib_m1
            offset = i
        elif arr[i] > target:
            fib_m = fib_m2
            fib_m1 = fib_m1 - fib_m2
            fib_m2 = fib_m - fib_m1
        else:
            return i
    if fib_m1 and offset + 1 < n and arr[offset + 1] == target:
        return offset + 1
    return -1

values = [10, 22, 35, 40, 45, 50, 80, 82, 85, 90, 100]
result = fibonacci_search(values, 85)
print("Found at index:", result)
`
  }
];
