import type { AlgorithmData, ConcreteWalkthrough, ConcreteWalkthroughStep } from './types';

export interface EnrichedAlgorithmData extends AlgorithmData {
  inDepthExplanation: string;
  concreteWalkthrough: ConcreteWalkthrough;
  applications: string[];
  edgeCases: string[];
  advantages: string[];
  disadvantages: string[];
}

/**
 * Derives concrete inputs, steps, and complexity explanations tailored to specific algorithms or categories.
 */
function deriveComplexityBreakdown(algo: AlgorithmData): {
  best: string;
  average: string;
  worst: string;
  space: string;
  explanation: string;
} {
  const time = algo.complexity.time;
  const space = algo.complexity.space;
  const name = algo.name.toLowerCase();

  let best = algo.complexity.best || time;
  let average = algo.complexity.average || time;
  let worst = algo.complexity.worst || time;
  let explanation = algo.complexity.breakdownExplanation || '';

  if (!explanation) {
    if (name.includes('bubble sort') || name.includes('cocktail')) {
      best = 'O(N)';
      average = 'O(N²)';
      worst = 'O(N²)';
      explanation = 'Best case O(N) occurs when the array is already sorted, terminating on the first pass with zero swaps. Average and worst cases require comparing and bubbling elements across (N-1) passes, performing N*(N-1)/2 comparisons, yielding O(N²). Space is O(1) auxiliary as elements are swapped in-place.';
    } else if (name.includes('insertion sort')) {
      best = 'O(N)';
      average = 'O(N²)';
      worst = 'O(N²)';
      explanation = 'Best case O(N) occurs on an already sorted array where each item only makes 1 comparison. Worst case O(N²) occurs on reverse-sorted input where each element shifts through the entire sorted prefix. Auxiliary space is O(1) in-place.';
    } else if (name.includes('selection sort')) {
      best = 'O(N²)';
      average = 'O(N²)';
      worst = 'O(N²)';
      explanation = 'Selection sort always executes two nested loops scanning the unsorted suffix for the minimum element regardless of initial ordering, making (N-1) + (N-2) + ... + 1 = O(N²) comparisons. Space is O(1) auxiliary.';
    } else if (name.includes('quick sort')) {
      best = 'O(N log N)';
      average = 'O(N log N)';
      worst = 'O(N²)';
      explanation = 'Best and average cases divide the array into balanced halves at each recursion level (log N levels * O(N) partitioning = O(N log N)). Worst case O(N²) occurs when the pivot consistently picks the extreme element (e.g. already sorted list with naive pivot), producing unbalanced subproblems of size 1 and N-1. Auxiliary space is O(log N) on the call stack.';
    } else if (name.includes('merge sort') || name.includes('timsort')) {
      best = name.includes('timsort') ? 'O(N)' : 'O(N log N)';
      average = 'O(N log N)';
      worst = 'O(N log N)';
      explanation = 'Guaranteed O(N log N) time because the array is always split evenly into halves (log N depth), and merging two sorted subarrays takes linear O(N) time at each depth level. Space is O(N) auxiliary for temporary buffers during merge.';
    } else if (name.includes('heap sort')) {
      best = 'O(N log N)';
      average = 'O(N log N)';
      worst = 'O(N log N)';
      explanation = 'Building the binary heap takes O(N) time. Extracting the root max element and sift-down takes O(log N) per element across N elements, giving strict O(N log N) in all cases with O(1) in-place auxiliary space.';
    } else if (name.includes('binary search')) {
      best = 'O(1)';
      average = 'O(log N)';
      worst = 'O(log N)';
      explanation = 'Best case O(1) when the target is found at the exact midpoint on the very first comparison. Average and worst cases halve the search space at every step (N/2, N/4, ... 1), terminating in ⌊log₂ N⌋ + 1 steps. Space is O(1) iterative.';
    } else if (name.includes('linear search')) {
      best = 'O(1)';
      average = 'O(N)';
      worst = 'O(N)';
      explanation = 'Best case O(1) when the target is at the 0th index. Worst case O(N) when the target is at the very end or absent, necessitating checking all N elements sequentially.';
    } else if (name.includes('dijkstra')) {
      best = 'O((V + E) log V)';
      average = 'O((V + E) log V)';
      worst = 'O((V + E) log V)';
      explanation = 'Each vertex is extracted from the min-heap priority queue once (V * log V), and every directed edge is relaxed at most once (E * log V with binary heap decreases/pushes), totaling O((V + E) log V). Space is O(V) for distances and heap.';
    } else if (name.includes('bellman-ford')) {
      best = 'O(E)';
      average = 'O(V * E)';
      worst = 'O(V * E)';
      explanation = 'Relaxes all E edges up to (V - 1) iterations to propagate shortest paths. If an early termination flag detects no distance updates in pass 1, best case is O(E). Worst case requires all (V-1) passes, yielding O(V * E). Space is O(V).';
    } else if (name.includes('floyd-warshall')) {
      best = 'O(V³)';
      average = 'O(V³)';
      worst = 'O(V³)';
      explanation = 'Contains three nested loops iterating from 1 to V (intermediate k, source i, destination j), testing if path i -> k -> j is shorter than i -> j. Always executes exactly V³ matrix cell updates. Space is O(V²) for the distance matrix.';
    } else if (name.includes('kadane')) {
      best = 'O(N)';
      average = 'O(N)';
      worst = 'O(N)';
      explanation = 'Processes the array in a single linear pass maintaining current_sum = max(x, current_sum + x). Each element is visited exactly once with constant-time arithmetic comparisons. Auxiliary space is O(1).';
    } else if (name.includes('knapsack') && name.includes('0/1')) {
      best = 'O(N * W)';
      average = 'O(N * W)';
      worst = 'O(N * W)';
      explanation = 'Pseudo-polynomial dynamic programming table of dimension (N+1) x (W+1), where each state transitions from the previous row in O(1). Time is O(N * W) and space can be optimized to O(W) using a 1D rolling array.';
    } else if (name.includes('kmp') || name.includes('knuth-morris-pratt')) {
      best = 'O(N + M)';
      average = 'O(N + M)';
      worst = 'O(N + M)';
      explanation = 'Preprocessing the pattern LPS (Longest Prefix Suffix) table takes O(M) time. The main search loop never backtracks the text index i, shifting the pattern pointer j according to LPS, achieving strict O(N) text scanning. Total time is O(N + M) and space is O(M).';
    } else {
      best = time.includes('N') ? time.replace('N²', 'N').replace('N log N', 'N') : time;
      average = time;
      worst = time;
      explanation = `The algorithm operates with an asymptotic bound of ${time}. Space complexity is bounded by ${space} auxiliary storage for tracking execution state, references, or recursion stack frames.`;
    }
  }

  return { best, average, worst, space, explanation };
}

/**
 * Builds an authentic, concrete walkthrough tracing real values step-by-step.
 */
function deriveConcreteWalkthrough(algo: AlgorithmData): ConcreteWalkthrough {
  if (algo.concreteWalkthrough) {
    return algo.concreteWalkthrough;
  }

  const name = algo.name.toLowerCase();

  // Sorting concrete walkthrough
  if (name.includes('bubble sort')) {
    return {
      inputExample: '[5, 2, 8, 1]',
      initialState: '[5, 2, 8, 1]',
      steps: [
        {
          step: 1,
          action: 'Compare & Swap index 0 and 1',
          state: '[2, 5, 8, 1]',
          explanation: 'Comparing 5 and 2: since 5 > 2, swap them so smaller 2 moves forward.',
        },
        {
          step: 2,
          action: 'Compare index 1 and 2',
          state: '[2, 5, 8, 1]',
          explanation: 'Comparing 5 and 8: 5 <= 8, no swap needed; elements are in relative order.',
        },
        {
          step: 3,
          action: 'Compare & Swap index 2 and 3',
          state: '[2, 5, 1, 8]',
          explanation: 'Comparing 8 and 1: 8 > 1, swap them. Value 8 is now bubbled to its final position at the end.',
        },
        {
          step: 4,
          action: 'Pass 2: Compare index 0 and 1',
          state: '[2, 5, 1, 8]',
          explanation: 'Comparing 2 and 5: 2 <= 5, no swap needed.',
        },
        {
          step: 5,
          action: 'Pass 2: Compare & Swap index 1 and 2',
          state: '[2, 1, 5, 8]',
          explanation: 'Comparing 5 and 1: 5 > 1, swap them. Value 5 settles into its correct sorted slot.',
        },
        {
          step: 6,
          action: 'Pass 3: Final compare & Swap index 0 and 1',
          state: '[1, 2, 5, 8]',
          explanation: 'Comparing 2 and 1: 2 > 1, swap them. All elements are now fully in ascending order.',
        },
      ],
      finalState: '[1, 2, 5, 8]',
      summary: 'Pass 1 moved 8 to the last index. Pass 2 moved 5 into position. Pass 3 resolved the final adjacent inversion between 2 and 1.',
    };
  }

  if (name.includes('selection sort')) {
    return {
      inputExample: '[29, 10, 14, 37, 13]',
      initialState: '[29, 10, 14, 37, 13]',
      steps: [
        {
          step: 1,
          action: 'Find minimum in suffix [10, 14, 37, 13] and swap with index 0',
          state: '[10, 29, 14, 37, 13]',
          explanation: 'Scanned remaining array; minimum element is 10 at index 1. Swapped 29 with 10.',
        },
        {
          step: 2,
          action: 'Find minimum in suffix [14, 37, 13] and swap with index 1',
          state: '[10, 13, 14, 37, 29]',
          explanation: 'Scanned suffix [14, 37, 13]; minimum is 13 at index 4. Swapped 29 with 13.',
        },
        {
          step: 3,
          action: 'Find minimum in suffix [37, 29] and swap with index 2',
          state: '[10, 13, 14, 37, 29]',
          explanation: 'Minimum is already 14 at index 2. No swap necessary.',
        },
        {
          step: 4,
          action: 'Find minimum in suffix [29] and swap with index 3',
          state: '[10, 13, 14, 29, 37]',
          explanation: 'Minimum is 29 at index 4. Swapped 37 with 29. Entire array is now sorted.',
        },
      ],
      finalState: '[10, 13, 14, 29, 37]',
      summary: 'Selection sort completed in 4 rounds with minimal write operations (at most N-1 swaps).',
    };
  }

  if (name.includes('binary search')) {
    return {
      inputExample: 'arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target = 23',
      initialState: 'left = 0, right = 9, middle = (0 + 9) // 2 = 4 (value = 16)',
      steps: [
        {
          step: 1,
          action: 'Check middle index 4',
          state: 'arr[4] = 16 vs target 23',
          explanation: 'Since 16 < 23, the target must lie in the right half. Update left = middle + 1 = 5.',
        },
        {
          step: 2,
          action: 'Check middle index 7',
          state: 'left = 5, right = 9, middle = (5 + 9) // 2 = 7, arr[7] = 56',
          explanation: 'Since 56 > 23, the target must lie in the left sub-window. Update right = middle - 1 = 6.',
        },
        {
          step: 3,
          action: 'Check middle index 5',
          state: 'left = 5, right = 6, middle = (5 + 6) // 2 = 5, arr[5] = 23',
          explanation: 'arr[5] == 23 matches the target! Search terminates successfully returning index 5.',
        },
      ],
      finalState: 'Target 23 found at index 5 in only 3 comparisons.',
      summary: 'A search space of 10 items was narrowed to 1 item in log₂(10) ≈ 3 comparisons.',
    };
  }

  if (name.includes('kadane')) {
    return {
      inputExample: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
      initialState: 'current_sum = 0, max_sum = -infinity',
      steps: [
        {
          step: 1,
          action: 'Process -2',
          state: 'current_sum = -2, max_sum = -2',
          explanation: 'First element initializes the running sum and maximum.',
        },
        {
          step: 2,
          action: 'Process 1',
          state: 'current_sum = max(1, -2 + 1) = 1, max_sum = 1',
          explanation: 'Prior negative sum was a drag; reset running sum to start fresh at 1.',
        },
        {
          step: 3,
          action: 'Process -3',
          state: 'current_sum = max(-3, 1 - 3) = -2, max_sum = 1',
          explanation: 'Adding -3 drops sum to -2. max_sum remains 1.',
        },
        {
          step: 4,
          action: 'Process 4',
          state: 'current_sum = max(4, -2 + 4) = 4, max_sum = 4',
          explanation: 'Fresh subarray starts at 4. Updates new record max_sum = 4.',
        },
        {
          step: 5,
          action: 'Process -1, 2, 1',
          state: 'current_sum accumulates: 4 -> 3 -> 5 -> 6, max_sum = 6',
          explanation: 'Subarray [4, -1, 2, 1] accumulates to 6, setting the maximum.',
        },
        {
          step: 6,
          action: 'Process -5, 4',
          state: 'current_sum drops to 1, then rises to 5. max_sum remains 6.',
          explanation: 'Final elements do not exceed the peak contiguous sum of 6.',
        },
      ],
      finalState: 'Maximum Subarray Sum = 6 (subarray [4, -1, 2, 1])',
      summary: 'Kadane algorithm computed the global optimum in a single linear pass O(N) with O(1) space.',
    };
  }

  if (name.includes('dijkstra')) {
    return {
      inputExample: 'Graph: A-(4)->B, A-(2)->C, C-(1)->B, B-(5)->D, C-(8)->D. Start at A.',
      initialState: 'distances = {A: 0, B: inf, C: inf, D: inf}, PriorityQueue = [(0, A)]',
      steps: [
        {
          step: 1,
          action: 'Pop A (dist 0). Relax neighbors B and C',
          state: 'distances = {A: 0, B: 4, C: 2, D: inf}',
          explanation: 'Edge A->C cost 2 < inf, updates C: 2. Edge A->B cost 4 < inf, updates B: 4. Push C and B to queue.',
        },
        {
          step: 2,
          action: 'Pop C (dist 2). Relax neighbors B and D',
          state: 'distances = {A: 0, B: 3, C: 2, D: 10}',
          explanation: 'Path A->C->B has cost 2 + 1 = 3 < 4! Distance to B improves to 3. Edge C->D cost 2 + 8 = 10 updates D.',
        },
        {
          step: 3,
          action: 'Pop B (dist 3). Relax neighbor D',
          state: 'distances = {A: 0, B: 3, C: 2, D: 8}',
          explanation: 'Path A->C->B->D has cost 3 + 5 = 8 < 10! Distance to D improves from 10 to 8.',
        },
        {
          step: 4,
          action: 'Pop D (dist 8). All vertices visited',
          state: 'Final shortest paths: A->B: 3, A->C: 2, A->D: 8',
          explanation: 'Target node D reached with optimal cost 8 via path A -> C -> B -> D.',
        },
      ],
      finalState: 'Shortest distances from source A: {A: 0, B: 3, C: 2, D: 8}',
      summary: 'Greedy choice property ensured optimal distances at each pop, finding the shortcut through C to B.',
    };
  }

  // Generic structured walkthrough derived from stepByStepLogic
  const steps: ConcreteWalkthroughStep[] = algo.stepByStepLogic.map((logic, idx) => ({
    step: idx + 1,
    action: logic.split(':')[0] || `Phase ${idx + 1}`,
    state: `State after phase ${idx + 1}`,
    explanation: logic.includes(':') ? logic.split(':').slice(1).join(':').trim() : logic,
  }));

  return {
    inputExample: `Sample execution for ${algo.name}`,
    initialState: 'Initial configuration: inputs initialized in memory.',
    steps,
    finalState: `Algorithm successfully terminates, returning canonical solution for ${algo.name}.`,
    summary: `Executed ${steps.length} procedural phases adhering to the formal invariant of ${algo.name}.`,
  };
}

/**
 * Returns a fully enriched algorithm with in-depth tutorial content,
 * concrete walkthroughs, and complexity breakdowns.
 */
export function getEnrichedAlgorithm(algo: AlgorithmData): EnrichedAlgorithmData {
  const complexity = deriveComplexityBreakdown(algo);
  const walkthrough = deriveConcreteWalkthrough(algo);

  const inDepthExplanation =
    algo.inDepthExplanation ||
    `${algo.explanation}

### Intuition & Core Principle
${algo.realWorldExample}

At its core, **${algo.name}** is engineered to maintain a strict algorithmic invariant. By methodically reducing the problem space at each iteration or recursive call, it guarantees termination with optimal or correct results.

### Key Operational Characteristics
1. **Behavioral Paradigm**: Employs structured state transitions so that once a sub-result is locked or verified, it is never recalculated or erroneously overridden.
2. **Data Structure Affinity**: Leverages the natural properties of the underlying structure (such as contiguous memory cache-locality, pointer traversal, or balanced branching) to maximize runtime efficiency.
3. **Correctness Invariant**: At the conclusion of every step, the processed portion of the problem conforms strictly to the target specification while the remaining unvisited space shrinks monotonically.`;

  const applications = algo.applications || [
    `Core component in systems programming, software frameworks, and standard libraries.`,
    `Database query optimization, index lookups, and disk storage access pipelines.`,
    `Real-time graph routing, network protocol routing tables, and distributed systems.`,
    `Competitive programming, interview technical challenges, and algorithmic design patterns.`,
  ];

  const edgeCases = algo.edgeCases || [
    'Empty or null input collections (should return empty or gracefully abort with O(1) checks).',
    'Single-element inputs (should require 0 swaps/comparisons and return immediately).',
    'Collections with all duplicate or identical elements (must maintain stability where applicable).',
    'Reverse-ordered or degenerate configurations (must gracefully handle worst-case depth without crashing).',
    'Large scale inputs approaching maximum stack depth or memory limits.',
  ];

  const advantages = algo.advantages || [
    'Deterministic execution and mathematically proven correctness bounds.',
    'Efficient utilization of computational resources and memory layout.',
    'Widely documented, battle-tested in production operating systems and language runtimes.',
  ];

  const disadvantages = algo.disadvantages || [
    'May exhibit performance degradation on adversarial or worst-case input distributions.',
    'Recursive variants may risk stack overflow on very deep structures without tail recursion or iteration.',
  ];

  return {
    ...algo,
    complexity: {
      ...algo.complexity,
      best: complexity.best,
      average: complexity.average,
      worst: complexity.worst,
      breakdownExplanation: complexity.explanation,
    },
    inDepthExplanation,
    concreteWalkthrough: walkthrough,
    applications,
    edgeCases,
    advantages,
    disadvantages,
  };
}
