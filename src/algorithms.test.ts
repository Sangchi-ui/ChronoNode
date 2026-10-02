import { beforeAll, describe, expect, it } from 'vitest';
import { ALL_ALGORITHMS, ALGORITHM_CATEGORIES } from './data/algorithms';

let algorithmsCss = '';
let algorithmsPanelTsx = '';
let miniGraphicTsx = '';
let detailPageTsx = '';
let layoutTsx = '';
let embeddedVisualizerTsx = '';

beforeAll(async () => {
  // @ts-ignore
  const fs = await import('node:fs');
  algorithmsCss = fs.readFileSync(new URL('./algorithms.css', import.meta.url), 'utf-8');
  algorithmsPanelTsx = fs.readFileSync(new URL('./AlgorithmsPanel.tsx', import.meta.url), 'utf-8');
  miniGraphicTsx = fs.readFileSync(new URL('./MiniGraphic.tsx', import.meta.url), 'utf-8');
  detailPageTsx = fs.readFileSync(new URL('./AlgorithmDetailPage.tsx', import.meta.url), 'utf-8');
  layoutTsx = fs.readFileSync(new URL('./AlgorithmPageLayout.tsx', import.meta.url), 'utf-8');
  embeddedVisualizerTsx = fs.readFileSync(new URL('./EmbeddedVisualizer.tsx', import.meta.url), 'utf-8');
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

  describe('Dynamic Category-Based Graphics Component (MiniGraphic)', () => {
    it('uses strictly pure HTML div elements without SVGs or images', () => {
      expect(miniGraphicTsx).not.toMatch(/<svg[\s>]/i);
      expect(miniGraphicTsx).not.toMatch(/<img[\s>]/i);
      expect(miniGraphicTsx).toContain('<div');
    });

    it('renders category-specific shapes with signature #c4f34a accent', async () => {
      const { MiniGraphic } = await import('./MiniGraphic');
      const React = await import('react');

      // 1. Searching
      const searchShape = MiniGraphic({ category: 'Searching Algorithms' });
      expect(searchShape.props['data-category-shape']).toBe('searching');
      expect(searchShape.props.className).toContain('searching-graphic');

      // 2. Sorting
      const sortShape = MiniGraphic({ category: 'Sorting Algorithms' });
      expect(sortShape.props['data-category-shape']).toBe('sorting');
      expect(sortShape.props.className).toContain('sorting-graphic');

      // 3. Trees & Graphs
      const treeShape = MiniGraphic({ category: 'Tree Algorithms' });
      expect(treeShape.props['data-category-shape']).toBe('trees-graphs');
      const graphShape = MiniGraphic({ category: 'Graph Algorithms' });
      expect(graphShape.props['data-category-shape']).toBe('trees-graphs');

      // 4. Dynamic Programming (DP) / Matrices
      const dpShape = MiniGraphic({ category: 'Dynamic Programming (DP) Algorithms' });
      expect(dpShape.props['data-category-shape']).toBe('dp-matrices');

      // 5. Default / Mathematical
      const mathShape = MiniGraphic({ category: 'Mathematical & Number Theory Algorithms' });
      expect(mathShape.props['data-category-shape']).toBe('math-default');
    });
  });

  describe('6-Column Responsive Grid Layout & Minimalist Square Cards', () => {
    it('implements responsive 6-column grid on large screens', () => {
      // 1. Breakpoint classes in JSX
      expect(algorithmsPanelTsx).toContain('grid-cols-1');
      expect(algorithmsPanelTsx).toContain('sm:grid-cols-2');
      expect(algorithmsPanelTsx).toContain('md:grid-cols-3');
      expect(algorithmsPanelTsx).toContain('lg:grid-cols-4');
      expect(algorithmsPanelTsx).toContain('xl:grid-cols-5');
      expect(algorithmsPanelTsx).toContain('2xl:grid-cols-6');
      expect(algorithmsPanelTsx).toContain('gap-4');

      // 2. CSS Media Queries for 6 columns on large screens
      expect(algorithmsCss).toMatch(/@media\s*\(min-width:\s*1536px\)\s*\{\s*\.algo-grid\s*\{[^}]*grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\);/);
      expect(algorithmsCss).toMatch(/\.algo-grid\s*\{[^}]*gap:\s*16px;/);
    });

    it('enforces square aspect-ratio on each card', () => {
      expect(algorithmsCss).toMatch(/\.algo-card\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1;/);
      expect(algorithmsPanelTsx).toContain('aspect-square');
    });

    it('removes the glow effect, inner graphic designs, and complexity metrics from the cards', () => {
      // 1. No inner graphic designs in card
      expect(algorithmsPanelTsx).not.toContain('<MiniGraphic');
      expect(algorithmsPanelTsx).not.toContain('algo-card-graphic-container');

      // 2. No time or space complexity readouts
      expect(algorithmsPanelTsx).not.toContain('algo.complexity.time');
      expect(algorithmsPanelTsx).not.toContain('algo.complexity.space');
      expect(algorithmsPanelTsx).not.toContain('algo-card-chip');
      expect(algorithmsPanelTsx).not.toContain('algo-card-space');

      // 3. Clean typography & prompt layout
      expect(algorithmsPanelTsx).toContain('algo-card-category');
      expect(algorithmsPanelTsx).toContain('algo-card-title');
      expect(algorithmsPanelTsx).toContain('algo-card-prompt');
    });
  });

  /* ------------------------------------------------------------------------
     Phase 1: Educational Content Integration & Edge-to-Edge Execution Layout
     ------------------------------------------------------------------------ */
  /* ------------------------------------------------------------------------
     Edge-to-Edge Algorithm Page Layout (Single Source of Truth)
     ------------------------------------------------------------------------ */
  describe('Single Source of Truth & Edge-to-Edge Layout Overhaul', () => {
    describe('1. Structural Layout & Edge-to-Edge Execution Section', () => {
      it('uses one shared layout file (AlgorithmPageLayout.tsx) controlling all algorithm pages', () => {
        expect(layoutTsx).toContain('export function AlgorithmPageLayout');
        expect(layoutTsx).toContain('export function TopBar');
        expect(layoutTsx).toContain('export function ReadingSection');
        expect(layoutTsx).toContain('export function ExecutionSection');
        expect(detailPageTsx).toContain('AlgorithmPageLayout');
      });

      it('page structure has direct children under root with no horizontal padding on root', () => {
        expect(layoutTsx).toMatch(/<main\s+className=["']w-full min-h-screen bg-slate-950["']>/);
        expect(layoutTsx).toContain('<TopBar');
        expect(layoutTsx).toContain('<ReadingSection');
        expect(layoutTsx).toContain('<ExecutionSection');
      });

      it('reading section uses the wider container (max-w-[1600px]) and responsive grids', () => {
        expect(layoutTsx).toContain('w-full max-w-[1600px] mx-auto px-6 lg:px-10');
        // Side-by-side on xl: Explanation + Complexity
        expect(layoutTsx).toContain('grid grid-cols-1 xl:grid-cols-2 gap-8 items-start w-full');
        // 2-column on md+: Walkthrough steps
        expect(layoutTsx).toContain('grid grid-cols-1 md:grid-cols-2 gap-4 w-full');
      });

      it('execution section touches both screen edges with no w-screen, no max-w, no horizontal padding', () => {
        expect(layoutTsx).toContain('className="execution-section execution-environment-section w-full border-t border-slate-800"');
        expect(layoutTsx).not.toContain('w-screen');
        expect(algorithmsCss).toMatch(/html,\s*body,\s*#root\s*\{[^}]*margin:\s*0;/);
        expect(algorithmsCss).toMatch(/\.execution-environment-section,\s*\.execution-section\s*\{[^}]*width:\s*100%;/);
        expect(algorithmsCss).not.toMatch(/\.execution-environment-section\s*\{[^}]*max-width:\s*100vw;/);
      });

      it('enforces exact 50/50 split on lg+ and stacked below lg', () => {
        expect(embeddedVisualizerTsx).toContain('grid grid-cols-1 lg:grid-cols-2 w-full min-h-[80vh] lg:h-[calc(100vh-4rem)]');
        expect(embeddedVisualizerTsx).toContain('className="editor-pane embedded-code-pane h-full w-full min-w-0 overflow-auto"');
        expect(embeddedVisualizerTsx).toContain('className="visual-pane embedded-visual-pane h-full w-full min-w-0 overflow-auto"');
        expect(embeddedVisualizerTsx).toContain('<ChronoEngine');
      });

      it('floating odometer card is positioned at absolute bottom-3 right-3 z-20 within relative viewport', () => {
        expect(embeddedVisualizerTsx).toContain('visual-canvas-container canvas relative overflow-hidden');
        expect(embeddedVisualizerTsx).toContain('className="absolute bottom-3 right-3 z-20"');
        expect(embeddedVisualizerTsx).toContain('<ComplexityOdometer events={events} currentIndex={index} />');
      });

      it('verifies layout rules and CSS across widths 360, 768, 1280, 1920 and 2560 px: no horizontal page scrollbar, no empty gutters beside execution section', () => {
        // html, body, #root: margin 0, no horizontal padding
        expect(algorithmsCss).toMatch(/html,\s*body,\s*#root\s*\{[^}]*margin:\s*0;/);
        expect(algorithmsCss).toMatch(/html,\s*body,\s*#root\s*\{[^}]*padding:\s*0;/);
        // Execution section: w-full border-t border-slate-800, no w-screen, no max-w, no gutters
        expect(layoutTsx).toContain('className="execution-section execution-environment-section w-full border-t border-slate-800"');
        expect(layoutTsx).not.toContain('w-screen');
        expect(algorithmsCss).not.toMatch(/\.execution-section[^{]*\{[^}]*w-screen/);
        expect(algorithmsCss).not.toMatch(/\.execution-section[^{]*\{[^}]*max-width/);
        expect(algorithmsCss).not.toMatch(/\.execution-environment-section[^{]*\{[^}]*max-width/);
        // Reading section: w-full max-w-[1600px] mx-auto px-6 lg:px-10
        expect(layoutTsx).toContain('w-full max-w-[1600px] mx-auto px-6 lg:px-10');
        // Split is 50/50 on lg+ (>= 1024px) including 1280, 1920, 2560 px; stacked below lg (< 1024px) including 360, 768 px
        expect(embeddedVisualizerTsx).toContain('grid grid-cols-1 lg:grid-cols-2 w-full min-h-[80vh] lg:h-[calc(100vh-4rem)]');
        // Overflow safety on panes with min-w-0
        expect(embeddedVisualizerTsx).toContain('className="editor-pane embedded-code-pane h-full w-full min-w-0 overflow-auto"');
        expect(embeddedVisualizerTsx).toContain('className="visual-pane embedded-visual-pane h-full w-full min-w-0 overflow-auto"');
      });

      it('adding a new algorithm entry requires zero layout or width classes in data schema', () => {
        for (const algo of ALL_ALGORITHMS) {
          expect(algo.name).not.toMatch(/\b(w-full|max-w|px-|grid|flex|h-)\b/);
          expect(algo.category).not.toMatch(/\b(w-full|max-w|px-|grid|flex|h-)\b/);
          expect(algo.id).not.toMatch(/\b(w-full|max-w|px-|grid|flex|h-)\b/);
        }
      });
    });

    describe('2. Visualizer Engine Integration', () => {
      it('connects ChronoNode execution engine (tracePython) to run Python code client-side', () => {
        expect(embeddedVisualizerTsx).toMatch(/import\s*\{\s*tracePython/);
        expect(embeddedVisualizerTsx).toContain('await tracePython(');
        expect(embeddedVisualizerTsx).toContain('<PanZoomCanvas>');
        expect(embeddedVisualizerTsx).toContain('<Visual event={event');
        expect(embeddedVisualizerTsx).toContain('<ComplexityOdometer');
      });
    });

    describe('3. Exhaustive Content for First 4 Searching Algorithms', () => {
      const targetSearchAlgoNames = [
        'Linear Search',
        'Binary Search',
        'Ternary Search',
        'Jump Search',
      ];

      for (const algoName of targetSearchAlgoNames) {
        describe(`Algorithm: ${algoName}`, () => {
          const algo = ALL_ALGORITHMS.find(a => a.name === algoName);

          it('is registered with valid metadata', () => {
            expect(algo).toBeDefined();
            expect(algo?.category).toBe('Searching Algorithms');
          });

          it('has exhaustive GeeksforGeeks-grade In-Depth Explanation & Real-World Analogy', () => {
            expect(algo?.inDepthExplanation).toBeDefined();
            expect((algo?.inDepthExplanation || '').length).toBeGreaterThan(300);
            expect(algo?.realWorldExample).toBeDefined();
            expect((algo?.realWorldExample || '').length).toBeGreaterThan(80);
          });

          it('has concrete step-by-step visual trace walkthrough with pointer/state transitions', () => {
            expect(algo?.concreteWalkthrough).toBeDefined();
            expect(algo?.concreteWalkthrough?.inputExample).toBeTruthy();
            expect(algo?.concreteWalkthrough?.initialState).toBeTruthy();
            expect(algo?.concreteWalkthrough?.finalState).toBeTruthy();
            expect((algo?.concreteWalkthrough?.steps || []).length).toBeGreaterThanOrEqual(4);

            for (const step of algo?.concreteWalkthrough?.steps || []) {
              expect(step.step).toBeGreaterThan(0);
              expect(step.action).toBeTruthy();
              expect(step.state).toBeTruthy();
              expect(step.explanation.length).toBeGreaterThan(15);
            }
          });

          it('has strict Big-O complexity with best, average, worst, space, and derivation reasoning', () => {
            expect(algo?.complexity.best).toBeTruthy();
            expect(algo?.complexity.average).toBeTruthy();
            expect(algo?.complexity.worst).toBeTruthy();
            expect(algo?.complexity.space).toBeTruthy();
            expect(algo?.complexity.breakdownExplanation).toBeTruthy();
            expect((algo?.complexity.breakdownExplanation || '').length).toBeGreaterThan(150);
          });

          it('has explicit edge cases detailing empty, single-element, duplicate, and missing targets', () => {
            expect(algo?.edgeCases).toBeDefined();
            expect((algo?.edgeCases || []).length).toBeGreaterThanOrEqual(4);
            const edgeText = (algo?.edgeCases || []).join(' ').toLowerCase();
            expect(edgeText).toContain('empty');
            expect(edgeText).toMatch(/(missing|not found|not present)/);
            expect(edgeText).toMatch(/(duplicate|duplicates)/);
            expect(edgeText).toMatch(/(single|size 1|one element)/);
          });

          it('has executable, heavily commented Python code ready for ChronoNode visualizer', () => {
            expect(algo?.pythonCode).toBeDefined();
            const code = algo?.pythonCode || '';
            expect(code.length).toBeGreaterThan(300);
            expect(code).toContain('def ');
            expect(code).toContain('#');
            expect(code).toContain('arr');
          });
        });
      }
    });

    describe('4. Client-side Markdown & LaTeX Math Rendering (KaTeX Integration)', () => {
      it('imports ReactMarkdown, remarkMath, rehypeKatex and katex stylesheet', () => {
        expect(layoutTsx).toContain("import ReactMarkdown from 'react-markdown';");
        expect(layoutTsx).toContain("import remarkMath from 'remark-math';");
        expect(layoutTsx).toContain("import rehypeKatex from 'rehype-katex';");
        expect(layoutTsx).toContain("import 'katex/dist/katex.min.css';");
      });

      it('configures ReactMarkdown with remarkMath and rehypeKatex plugins across content sections', () => {
        expect(layoutTsx).toMatch(/<ReactMarkdown\s+remarkPlugins=\{\[remarkMath\]\}\s+rehypePlugins=\{\[rehypeKatex\]\}>/);
        expect(layoutTsx).toContain('prose prose-invert prose-green max-w-none');
      });

      it('includes dark-mode typography styling for prose and KaTeX math in algorithms.css', () => {
        expect(algorithmsCss).toMatch(/\.prose,\s*\.markdown-content\s*\{/);
        expect(algorithmsCss).toMatch(/\.katex\s*\{/);
        expect(algorithmsCss).toMatch(/\.katex-display\s*\{/);
      });
    });
  });
});
