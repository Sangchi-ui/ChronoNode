import { describe, expect, it } from 'vitest';
import { ALL_ALGORITHMS, ALGORITHM_CATEGORIES } from './data/algorithms';

describe('Algorithms Registry', () => {
  it('should contain all 14 categories', () => {
    expect(ALGORITHM_CATEGORIES).toHaveLength(14);
    const expectedCategories = [
      'Searching Algorithms',
      'Sorting Algorithms',
      'Array, Two-Pointer, and Sliding Window Algorithms',
      'Graph Algorithms',
      'Tree Algorithms',
      'Dynamic Programming (DP) Algorithms',
      'Greedy Algorithms',
      'String & Pattern Matching Algorithms',
      'Mathematical & Number Theory Algorithms',
      'Divide and Conquer Algorithms',
      'Backtracking Algorithms',
      'Bit Manipulation Algorithms',
      'Computational Geometry Algorithms',
      'Randomized & Heuristic Algorithms',
    ];
    for (const cat of expectedCategories) {
      expect(ALGORITHM_CATEGORIES).toContain(cat);
    }
  });

  it('should contain exactly 144 algorithms with valid schemas', () => {
    expect(ALL_ALGORITHMS.length).toBe(144);

    const ids = new Set<string>();
    for (const algo of ALL_ALGORITHMS) {
      expect(algo.id).toBeTruthy();
      expect(ids.has(algo.id)).toBe(false);
      ids.add(algo.id);

      expect(algo.name).toBeTruthy();
      expect(ALGORITHM_CATEGORIES).toContain(algo.category);

      // Section 1: Explanation
      expect(typeof algo.explanation).toBe('string');
      expect(algo.complexity).toBeTruthy();
      expect(algo.complexity.time).toBeTruthy();
      expect(algo.complexity.space).toBeTruthy();

      // Section 2: Real-World Example
      expect(typeof algo.realWorldExample).toBe('string');
      expect(algo.realWorldExample.trim().length).toBeGreaterThan(15);

      // Section 3: Step-by-Step Logic
      expect(Array.isArray(algo.stepByStepLogic)).toBe(true);
      expect(algo.stepByStepLogic.length).toBeGreaterThanOrEqual(3);
      for (const step of algo.stepByStepLogic) {
        expect(step.trim().length).toBeGreaterThan(5);
      }

      // Section 4: Python Code
      expect(typeof algo.pythonCode).toBe('string');
      expect(algo.pythonCode.trim().length).toBeGreaterThan(30);
    }
  });

  it('should generate deep educational tutorial content for any algorithm', async () => {
    const { getEnrichedAlgorithm } = await import('./data/algorithms/enrichment');
    const bubbleSort = ALL_ALGORITHMS.find(a => a.name === 'Bubble Sort')!;
    const enriched = getEnrichedAlgorithm(bubbleSort);

    expect(enriched.inDepthExplanation.length).toBeGreaterThan(100);
    expect(enriched.concreteWalkthrough.inputExample).toBeTruthy();
    expect(enriched.concreteWalkthrough.steps.length).toBeGreaterThanOrEqual(3);
    for (const step of enriched.concreteWalkthrough.steps) {
      expect(step.step).toBeGreaterThan(0);
      expect(step.action).toBeTruthy();
      expect(step.state).toBeTruthy();
      expect(step.explanation).toBeTruthy();
    }
    expect(enriched.complexity.best).toBeTruthy();
    expect(enriched.complexity.average).toBeTruthy();
    expect(enriched.complexity.worst).toBeTruthy();
    expect(enriched.complexity.breakdownExplanation).toBeTruthy();
    expect(enriched.applications.length).toBeGreaterThan(0);
    expect(enriched.edgeCases.length).toBeGreaterThan(0);
  });

  it('should verify all required algorithms from user prompt master list are present', () => {
    const requiredNames = [
      // 1. Searching
      'Linear Search', 'Binary Search', 'Ternary Search', 'Jump Search',
      'Interpolation Search', 'Exponential Search', 'Fibonacci Search',
      // 2. Sorting
      'Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort',
      'Heap Sort', 'Radix Sort', 'Counting Sort', 'Bucket Sort', 'Shell Sort',
      'Comb Sort', 'Pigeonhole Sort', 'Cycle Sort', 'Pancake Sort', 'TimSort',
      'Cocktail Shaker Sort', 'Odd-Even Sort (Brick Sort)', 'Bogo Sort',
      // 3. Array, Two-Pointer, and Sliding Window
      'Kadane’s Algorithm', 'Dutch National Flag Algorithm', 'Boyer-Moore Majority Vote Algorithm',
      'Sliding Window Algorithm', 'Two-Pointer Algorithm', 'Prefix Sum Algorithm',
      'Difference Array Algorithm', 'Mo’s Algorithm', 'K-Way Merge Algorithm',
      'Floyd’s Cycle Detection Algorithm (Tortoise and Hare)', 'Brent’s Cycle Detection Algorithm',
      // 4. Graph
      'Dijkstra’s Algorithm', 'Bellman-Ford Algorithm', 'Floyd-Warshall Algorithm',
      'Johnson’s Algorithm', 'A* Search Algorithm', 'Bidirectional Search',
      'Kruskal’s Algorithm', 'Prim’s Algorithm', 'Borůvka\'s Algorithm',
      'Breadth-First Search (BFS)', 'Depth-First Search (DFS)', 'Kosaraju’s Algorithm',
      'Tarjan’s Algorithm', 'Fleury’s Algorithm', 'Hierholzer’s Algorithm',
      'Hopcroft-Karp Algorithm', 'Kahn’s Algorithm', 'DFS-based Topological Sort',
      'Ford-Fulkerson Algorithm', 'Edmonds-Karp Algorithm', 'Dinic’s Algorithm',
      'Push-Relabel Algorithm (Tarjan\'s)',
      // 5. Tree
      'Pre-order, In-order, Post-order Traversals', 'Level Order Traversal',
      'Morris Traversal', 'AVL Tree Rotations', 'Red-Black Tree Rebalancing',
      'Splay Tree Splaying', 'Segment Tree Build/Update/Query', 'Lazy Propagation',
      'Fenwick Tree (Binary Indexed Tree)', 'Lowest Common Ancestor (LCA) - Binary Lifting',
      'Lowest Common Ancestor - Euler Tour + RMQ', 'Heavy-Light Decomposition (HLD)',
      'Centroid Decomposition',
      // 6. Dynamic Programming
      '0/1 Knapsack Algorithm', 'Unbounded Knapsack', 'Longest Common Subsequence (LCS)',
      'Longest Increasing Subsequence (LIS)', 'Matrix Chain Multiplication (MCM)',
      'Edit Distance (Levenshtein Distance)', 'Coin Change Algorithm', 'Subset Sum Algorithm',
      'Egg Dropping Algorithm', 'Rod Cutting Algorithm', 'Palindrome Partitioning',
      'Traveling Salesperson Problem (TSP)', 'Digit DP', 'DP on Trees',
      'Convex Hull Trick', 'Knuth Optimization',
      // 7. Greedy
      'Huffman Coding', 'Activity Selection Algorithm', 'Job Sequencing with Deadlines',
      'Fractional Knapsack', 'Egyptian Fraction Algorithm',
      // 8. String & Pattern Matching
      'Naive String Matching', 'Knuth-Morris-Pratt (KMP) Algorithm', 'Rabin-Karp Algorithm',
      'Z Algorithm', 'Boyer-Moore Algorithm', 'Aho-Corasick Algorithm',
      'Manacher’s Algorithm', 'Suffix Array Construction', 'Kasai’s Algorithm',
      'Ukkonen’s Algorithm',
      // 9. Mathematical & Number Theory
      'Euclidean Algorithm', 'Extended Euclidean Algorithm', 'Sieve of Eratosthenes',
      'Segmented Sieve', 'Modular Exponentiation', 'Matrix Exponentiation',
      'Prime Factorization', 'Pollard’s rho Algorithm', 'Fermat’s Little Theorem',
      'Miller-Rabin Primality Test', 'Chinese Remainder Theorem', 'Euler’s Totient Function',
      'Lucas Theorem', 'Fast Fourier Transform (FFT)', 'Karatsuba Algorithm',
      'Strassen’s Matrix Multiplication',
      // 10. Divide and Conquer
      'Closest Pair of Points', 'Inversion Count', 'Divide and Conquer DP Optimization',
      // 11. Backtracking
      'N-Queens Algorithm', 'Sudoku Solver', 'Rat in a Maze',
      'Hamiltonian Cycle Algorithm', 'M-Coloring Algorithm', 'Subset Generation',
      'Permutation Generation',
      // 12. Bit Manipulation
      'Brian Kernighan’s Algorithm', 'Bit Masking', 'XOR Non-Repeating Element',
      // 13. Computational Geometry
      'Graham Scan', 'Jarvis March (Gift Wrapping)', 'QuickHull',
      'Sweep Line Algorithm', 'Rotating Calipers', 'Point in Polygon Check',
      'Shoelace Formula',
      // 14. Randomized & Heuristic
      'Reservoir Sampling', 'Fisher-Yates Shuffle', 'Monte Carlo Algorithms',
      'Las Vegas Algorithms', 'Minimax Algorithm', 'Alpha-Beta Pruning',
    ];

    expect(requiredNames.length).toBe(144);
    const namesInRegistry = new Set(ALL_ALGORITHMS.map(a => a.name));

    for (const name of requiredNames) {
      expect(namesInRegistry.has(name)).toBe(true);
    }
  });
});
