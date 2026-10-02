import { beforeAll, describe, expect, it } from 'vitest';
import { ALL_ALGORITHMS, ALGORITHM_CATEGORIES } from './data/algorithms';

let algorithmsCss = '';
let algorithmsPanelTsx = '';
let miniGraphicTsx = '';

beforeAll(async () => {
  // @ts-ignore
  const fs = await import('node:fs');
  algorithmsCss = fs.readFileSync(new URL('./algorithms.css', import.meta.url), 'utf-8');
  algorithmsPanelTsx = fs.readFileSync(new URL('./AlgorithmsPanel.tsx', import.meta.url), 'utf-8');
  miniGraphicTsx = fs.readFileSync(new URL('./MiniGraphic.tsx', import.meta.url), 'utf-8');
});

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

  describe('Category Filter Bar - Full Width, No Collapse', () => {
    it('spans 100% full width with flex-wrap and removes all expand/collapse mechanisms', () => {
      // 1. Flex Wrap & Full Width in CSS
      expect(algorithmsCss).toMatch(/\.algo-category-pills\s*\{[^}]*width:\s*100%;/);
      expect(algorithmsCss).toMatch(/\.algo-category-pills\s*\{[^}]*display:\s*flex;/);
      expect(algorithmsCss).toMatch(/\.algo-category-pills\s*\{[^}]*flex-wrap:\s*wrap;/);

      // 2. No horizontal scroll constraints or rogue scrollbars
      expect(algorithmsCss).not.toMatch(/\.algo-category-pills\s*\{[^}]*overflow-x:\s*(auto|scroll)/);
      expect(algorithmsCss).not.toMatch(/\.algo-category-pills\s*\{[^}]*whitespace-nowrap/);

      // 3. Expand / Collapse toggle & container completely removed
      expect(algorithmsCss).not.toContain('.algo-category-pills.is-collapsed');
      expect(algorithmsCss).not.toContain('.algo-category-pills.is-expanded');
      expect(algorithmsCss).not.toContain('.algo-pills-toggle-btn');
      expect(algorithmsCss).not.toContain('.algo-category-container');

      // 4. TSX component has full width classes and no expand/collapse state
      expect(algorithmsPanelTsx).toContain('className="algo-category-pills w-full flex flex-wrap');
      expect(algorithmsPanelTsx).not.toContain('isExpanded');
      expect(algorithmsPanelTsx).not.toContain('algo-pills-toggle-btn');
      expect(algorithmsPanelTsx).not.toContain('algo-category-container');
      expect(algorithmsPanelTsx).not.toContain('ChevronDown');
      expect(algorithmsPanelTsx).not.toContain('ChevronUp');
    });
  });

  describe('Dynamic Category-Based Graphics (MiniGraphic)', () => {
    it('is integrated into algorithm cards in AlgorithmsPanel', () => {
      expect(algorithmsPanelTsx).toContain("import { MiniGraphic } from './MiniGraphic'");
      expect(algorithmsPanelTsx).toContain('<MiniGraphic category={algo.category} />');
      expect(algorithmsPanelTsx).toContain('algo-card-graphic-container');
    });

    it('uses strictly pure HTML div elements without SVGs or images', () => {
      expect(miniGraphicTsx).not.toMatch(/<svg[\s>]/i);
      expect(miniGraphicTsx).not.toMatch(/<img[\s>]/i);
      expect(miniGraphicTsx).toContain('<div');
    });

    it('renders category-specific shapes with glassmorphism and neon-green glow', async () => {
      const { MiniGraphic } = await import('./MiniGraphic');
      const React = await import('react');

      // 1. Searching: horizontal row of blocks with glowing neon green block
      const searchShape = MiniGraphic({ category: 'Searching Algorithms' });
      expect(searchShape.props['data-category-shape']).toBe('searching');
      expect(searchShape.props.className).toContain('searching-graphic');

      // 2. Sorting: vertical bars of varying heights with neon green highlights
      const sortShape = MiniGraphic({ category: 'Sorting Algorithms' });
      expect(sortShape.props['data-category-shape']).toBe('sorting');
      expect(sortShape.props.className).toContain('sorting-graphic');

      // 3. Trees & Graphs: triangular / tree formation of nodes
      const treeShape = MiniGraphic({ category: 'Tree Algorithms' });
      expect(treeShape.props['data-category-shape']).toBe('trees-graphs');
      const graphShape = MiniGraphic({ category: 'Graph Algorithms' });
      expect(graphShape.props['data-category-shape']).toBe('trees-graphs');

      // 4. Dynamic Programming (DP) / Matrices: miniature 3x3 square grid
      const dpShape = MiniGraphic({ category: 'Dynamic Programming (DP) Algorithms' });
      expect(dpShape.props['data-category-shape']).toBe('dp-matrices');

      // 5. Default / Mathematical: two overlapping hollow CSS squares
      const mathShape = MiniGraphic({ category: 'Mathematical & Number Theory Algorithms' });
      expect(mathShape.props['data-category-shape']).toBe('math-default');
      const geomShape = MiniGraphic({ category: 'Computational Geometry Algorithms' });
      expect(geomShape.props['data-category-shape']).toBe('math-default');
    });

    it('defines glassmorphic and neon-green glow styling in algorithms.css', () => {
      expect(algorithmsCss).toContain('.algo-card-graphic-container');
      expect(algorithmsCss).toContain('.mini-graphic');
      expect(algorithmsCss).toContain('.searching-graphic');
      expect(algorithmsCss).toContain('.sorting-graphic');
      expect(algorithmsCss).toContain('.tree-graph-graphic');
      expect(algorithmsCss).toContain('.dp-matrix-graphic');
      expect(algorithmsCss).toContain('.math-default-graphic');
      // Neon green glow color
      expect(algorithmsCss).toContain('#c4f34a');
      expect(algorithmsCss).toContain('rgba(196, 243, 74');
    });
  });

  describe('5-Column Responsive Grid Layout & Wide Rectangular Cards', () => {
    it('implements responsive 5-column grid with gap-6', () => {
      // 1. Breakpoint classes in JSX
      expect(algorithmsPanelTsx).toContain('grid-cols-1');
      expect(algorithmsPanelTsx).toContain('sm:grid-cols-2');
      expect(algorithmsPanelTsx).toContain('lg:grid-cols-3');
      expect(algorithmsPanelTsx).toContain('xl:grid-cols-4');
      expect(algorithmsPanelTsx).toContain('2xl:grid-cols-5');
      expect(algorithmsPanelTsx).toContain('gap-6');

      // 2. CSS Media Queries for 5 columns on large screens
      expect(algorithmsCss).toMatch(/@media\s*\(min-width:\s*1536px\)\s*\{\s*\.algo-grid\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\);/);
      expect(algorithmsCss).toMatch(/\.algo-grid\s*\{[^}]*gap:\s*24px;/);
    });

    it('removes square aspect-ratio and enforces wide rectangular proportions with generous padding', () => {
      // 1. No aspect-square or aspect-ratio: 1 / 1
      expect(algorithmsCss).not.toMatch(/\.algo-card\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1/);
      expect(algorithmsPanelTsx).not.toContain('aspect-square');

      // 2. Minimum height and generous padding
      expect(algorithmsCss).toMatch(/\.algo-card\s*\{[^}]*min-height:\s*210px;/);
      expect(algorithmsCss).toMatch(/\.algo-card\s*\{[^}]*padding:\s*24px\s+26px;/);
      expect(algorithmsPanelTsx).toContain('p-6');
      expect(algorithmsPanelTsx).toContain('min-h-[210px]');

      // 3. Inner layout space distribution
      expect(algorithmsPanelTsx).toContain('flex flex-col justify-between h-full');
      expect(algorithmsCss).toMatch(/\.algo-card-inner\s*\{[^}]*justify-content:\s*space-between;/);
    });
  });
});
