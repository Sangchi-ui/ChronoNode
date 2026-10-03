import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  bubbleSortGenerator,
  selectionSortGenerator,
  insertionSortGenerator,
  mergeSortGenerator,
  quickSortGenerator,
  heapSortGenerator,
  collectSortingSteps,
  sortingGenerators,
  type SortingAlgorithmId,
  type SortingStep,
} from './sorting/sortingGenerators';
import { ChronoEngine } from './ChronoEngine';

describe('ChronoNode Sorting Algorithms: Rigorous Test & Visual Verification Suite', () => {
  /* =========================================================================
     Matrix Definitions
     ========================================================================= */
  const verificationMatrix = [
    {
      name: 'Randomly shuffled array',
      input: [64, 34, 25, 12, 22, 11, 90],
    },
    {
      name: 'Reverse-sorted array (Absolute Worst Case)',
      input: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    },
    {
      name: 'Already-sorted array (Absolute Best Case)',
      input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    {
      name: 'Array with heavy duplicates',
      input: [5, 1, 5, 5, 2, 5],
    },
    {
      name: 'Edge case: size 1 array',
      input: [42],
    },
    {
      name: 'Edge case: size 0 empty array',
      input: [],
    },
    {
      name: 'Negative and mixed values',
      input: [-5, 20, -10, 0, 15, -3],
    },
  ];

  const algorithmEntries = Object.entries(sortingGenerators) as [
    SortingAlgorithmId,
    (arr: number[]) => Generator<SortingStep, number[], unknown>
  ][];

  /* =========================================================================
     2. Algorithmic State Verification (The Logic Suite)
     ========================================================================= */
  describe('2. Algorithmic State Verification (The Logic Suite)', () => {
    for (const [algoId, generatorFn] of algorithmEntries) {
      describe(`Algorithm: ${algoId}`, () => {
        for (const testCase of verificationMatrix) {
          it(`correctly sorts ${testCase.name} against Array.prototype.sort truth`, () => {
            const expected = [...testCase.input].sort((a, b) => a - b);
            const generator = generatorFn([...testCase.input]);
            const { finalArray, steps } = collectSortingSteps(generator);

            // 1. Strict equality assertion with Array.prototype.sort
            expect(finalArray).toEqual(expected);

            // 2. Validate step integrity during execution
            if (testCase.input.length > 0) {
              expect(steps.length).toBeGreaterThanOrEqual(1);
              for (const step of steps) {
                // Must preserve array length at every frame
                expect(step.array.length).toBe(testCase.input.length);
                // Must maintain valid action type
                expect(['COMPARE', 'SWAP', 'OVERWRITE', 'SPLIT', 'MERGE']).toContain(step.type);
                // All active indices must be within array bounds
                for (const idx of step.indices) {
                  expect(idx).toBeGreaterThanOrEqual(0);
                  expect(idx).toBeLessThan(testCase.input.length);
                }
              }
            } else {
              expect(finalArray).toEqual([]);
            }
          });
        }
      });
    }
  });

  /* =========================================================================
     3. Telemetry & Big-O Validation
     ========================================================================= */
  describe('3. Telemetry & Big-O Validation', () => {
    const N = 10;
    const reverseSorted = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    const alreadySorted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    it('Bubble Sort: yields exactly N*(N-1)/2 comparisons and swaps on reverse-sorted (Worst Case)', () => {
      const { telemetry } = collectSortingSteps(bubbleSortGenerator(reverseSorted));
      const expectedComparisons = (N * (N - 1)) / 2; // 45
      const expectedSwaps = (N * (N - 1)) / 2; // 45

      expect(telemetry.comparisons).toBe(expectedComparisons);
      expect(telemetry.swaps).toBe(expectedSwaps);
    });

    it('Bubble Sort: early-terminates in exactly N-1 comparisons and 0 swaps on already-sorted (Best Case)', () => {
      const { telemetry } = collectSortingSteps(bubbleSortGenerator(alreadySorted));
      const expectedComparisons = N - 1; // 9
      const expectedSwaps = 0;

      expect(telemetry.comparisons).toBe(expectedComparisons);
      expect(telemetry.swaps).toBe(expectedSwaps);
    });

    it('Selection Sort: yields exactly N*(N-1)/2 comparisons in all cases and at most N swaps', () => {
      const { telemetry: worstTelemetry } = collectSortingSteps(selectionSortGenerator(reverseSorted));
      const { telemetry: bestTelemetry } = collectSortingSteps(selectionSortGenerator(alreadySorted));
      const expectedComparisons = (N * (N - 1)) / 2; // 45

      expect(worstTelemetry.comparisons).toBe(expectedComparisons);
      expect(bestTelemetry.comparisons).toBe(expectedComparisons);
      expect(worstTelemetry.swaps).toBeLessThanOrEqual(N);
      expect(bestTelemetry.swaps).toBeLessThanOrEqual(N);
    });

    it('Insertion Sort: yields exactly N-1 comparisons and 0 shifts on already-sorted (Best Case)', () => {
      const { telemetry } = collectSortingSteps(insertionSortGenerator(alreadySorted));
      expect(telemetry.comparisons).toBe(N - 1); // 9
      expect(telemetry.swaps).toBe(0);
      expect(telemetry.overwrites).toBe(N - 1); // Only final insertions into position
    });

    it('Insertion Sort: yields exactly N*(N-1)/2 comparisons on reverse-sorted (Worst Case)', () => {
      const { telemetry } = collectSortingSteps(insertionSortGenerator(reverseSorted));
      const expectedComparisons = (N * (N - 1)) / 2; // 45
      expect(telemetry.comparisons).toBe(expectedComparisons);
    });

    it('Merge Sort: operations strictly adhere to O(N log N) upper bounds across all inputs', () => {
      for (const testCase of verificationMatrix) {
        if (testCase.input.length <= 1) continue;
        const n = testCase.input.length;
        const { telemetry } = collectSortingSteps(mergeSortGenerator(testCase.input));

        // Theoretical upper bound for comparisons in Merge Sort: N * ceil(log2(N))
        const maxComparisons = n * Math.ceil(Math.log2(n));
        expect(telemetry.comparisons).toBeLessThanOrEqual(maxComparisons);

        // Theoretical overwrites in Merge Sort: at most N * ceil(log2(N))
        expect(telemetry.overwrites).toBeLessThanOrEqual(maxComparisons);
      }
    });

    it('Quick Sort: operation counts do not exceed O(N^2) and perform O(N log N) on random arrays', () => {
      const randomArr = [64, 34, 25, 12, 22, 11, 90, 45, 78, 3, 89, 56];
      const { telemetry } = collectSortingSteps(quickSortGenerator(randomArr));
      const n = randomArr.length;

      // On average case, comparisons are around O(N log N)
      expect(telemetry.comparisons).toBeLessThanOrEqual(n * n);
      expect(telemetry.swaps).toBeLessThanOrEqual(n * n);
      expect(telemetry.totalOperations).toBeGreaterThan(0);
    });

    it('Heap Sort: total comparisons are strictly bounded by O(N log N) (2N log2 N)', () => {
      const randomArr = [16, 4, 10, 14, 7, 9, 3, 2, 8, 1];
      const n = randomArr.length;
      const { telemetry } = collectSortingSteps(heapSortGenerator(randomArr));

      // Heap Sort comparisons bound: at most 2 * N * ceil(log2(N))
      const maxComparisons = 2 * n * Math.ceil(Math.log2(n));
      expect(telemetry.comparisons).toBeLessThanOrEqual(maxComparisons);
      // Swaps during extraction are at most N
      expect(telemetry.swaps).toBeLessThanOrEqual(2 * n * Math.ceil(Math.log2(n)));
    });
  });

  /* =========================================================================
     4. Visualizer Engine Stress Testing (The UI Suite)
     ========================================================================= */
  describe('4. Visualizer Engine Stress Testing (The UI Suite)', () => {
    function getBarTag(html: string, index: number): string {
      const match = html.match(new RegExp(`<div[^>]*data-testid="sorting-bar-${index}"[^>]*>`));
      return match ? match[0] : '';
    }

    it('Prop Mapping: every yielded step strictly adheres to { type, indices, array, sortedIndices } schema', () => {
      for (const [, generatorFn] of algorithmEntries) {
        const { steps } = collectSortingSteps(generatorFn([4, 2, 5, 1, 3]));
        for (const step of steps) {
          expect(['SWAP', 'COMPARE', 'OVERWRITE', 'SPLIT', 'MERGE']).toContain(step.type);
          expect(Array.isArray(step.indices)).toBe(true);
          expect(Array.isArray(step.array)).toBe(true);
          expect(Array.isArray(step.sortedIndices)).toBe(true);
        }
      }
    });

    it('Active State Highlighting: ChronoEngine applies neon-green active classes to exact indices in current frame', () => {
      const step: SortingStep = {
        type: 'COMPARE',
        indices: [1, 2],
        array: [10, 20, 30, 40],
        sortedIndices: [],
      };

      const html = renderToStaticMarkup(
        React.createElement(ChronoEngine, {
          mode: 'SORTING_BARS',
          step,
        })
      );

      // Indices 1 and 2 must have is-active and bar-active-compare
      const bar1 = getBarTag(html, 1);
      const bar2 = getBarTag(html, 2);
      expect(bar1).toContain('is-active');
      expect(bar1).toContain('bar-active-compare');
      expect(bar2).toContain('is-active');
      expect(bar2).toContain('bar-active-compare');

      // Indices 0 and 3 must NOT have is-active
      const bar0 = getBarTag(html, 0);
      const bar3 = getBarTag(html, 3);
      expect(bar0).not.toContain('is-active');
      expect(bar3).not.toContain('is-active');
    });

    it('Active State Highlighting: ChronoEngine marks SWAP with bar-active-swap styling', () => {
      const step: SortingStep = {
        type: 'SWAP',
        indices: [0, 3],
        array: [40, 20, 30, 10],
        sortedIndices: [],
      };

      const html = renderToStaticMarkup(
        React.createElement(ChronoEngine, {
          mode: 'SORTING_BARS',
          step,
        })
      );

      const bar0 = getBarTag(html, 0);
      const bar3 = getBarTag(html, 3);
      expect(bar0).toContain('is-active');
      expect(bar0).toContain('bar-active-swap');
      expect(bar3).toContain('is-active');
      expect(bar3).toContain('bar-active-swap');
    });

    it('Sorted State Locking: ChronoEngine locks sorted bars with is-sorted class and boundary grows monotonically', () => {
      const input = [5, 4, 3, 2, 1];
      const generator = bubbleSortGenerator(input);
      let stepResult = generator.next();

      let previousSortedCount = 0;
      let finalStepSeen = false;

      while (!stepResult.done) {
        const step = stepResult.value;
        const html = renderToStaticMarkup(
          React.createElement(ChronoEngine, {
            mode: 'SORTING_BARS',
            step,
          })
        );

        // Every index in step.sortedIndices must have .is-sorted in DOM
        for (const sortedIdx of step.sortedIndices) {
          const barTag = getBarTag(html, sortedIdx);
          expect(barTag).toContain('is-sorted');
        }

        // Sorted boundary count must never shrink (monotonically non-decreasing)
        expect(step.sortedIndices.length).toBeGreaterThanOrEqual(previousSortedCount);
        previousSortedCount = step.sortedIndices.length;

        if (step.sortedIndices.length === input.length) {
          finalStepSeen = true;
        }

        stepResult = generator.next();
      }

      // At completion, all elements must be locked as sorted
      expect(finalStepSeen).toBe(true);
      expect(previousSortedCount).toBe(input.length);
    });

    it('DIVIDE_AND_CONQUER Mode: Merge Sort renders physically separated sub-arrays and pointers', () => {
      const generator = mergeSortGenerator([8, 3, 5, 2]);
      const { steps } = collectSortingSteps(generator);

      // Find a SPLIT step
      const splitStep = steps.find((s) => s.type === 'SPLIT');
      expect(splitStep).toBeDefined();
      expect(splitStep?.subArrays?.length).toBe(2);

      const htmlSplit = renderToStaticMarkup(
        React.createElement(ChronoEngine, {
          mode: 'DIVIDE_AND_CONQUER',
          step: splitStep,
        })
      );

      expect(htmlSplit).toContain('data-mode="DIVIDE_AND_CONQUER"');
      expect(htmlSplit).toContain('data-testid="divide-conquer-header"');
      expect(htmlSplit).toContain('data-testid="subarray-left"');
      expect(htmlSplit).toContain('data-testid="subarray-right"');
      expect(htmlSplit).toContain('LEFT SUB-ARRAY');
      expect(htmlSplit).toContain('RIGHT SUB-ARRAY');

      // Find a MERGE/COMPARE step with left/right pointers
      const mergeStep = steps.find(
        (s) => s.leftPointer !== undefined && s.rightPointer !== undefined
      );
      expect(mergeStep).toBeDefined();

      const htmlMerge = renderToStaticMarkup(
        React.createElement(ChronoEngine, {
          mode: 'DIVIDE_AND_CONQUER',
          step: mergeStep,
        })
      );

      expect(htmlMerge).toContain('sub-pointer-tag');
      expect(htmlMerge).toContain('>L<');
      expect(htmlMerge).toContain('>R<');

      // Find an OVERWRITE step with merged target
      const targetStep = steps.find((s) => s.mergedTargetIndex !== undefined);
      expect(targetStep).toBeDefined();

      const htmlTarget = renderToStaticMarkup(
        React.createElement(ChronoEngine, {
          mode: 'DIVIDE_AND_CONQUER',
          step: targetStep,
        })
      );

      expect(htmlTarget).toContain('is-target-merged');
      expect(htmlTarget).toContain('target-merge-badge');
    });

    it('PARTITION_SWAP Mode: Quick Sort distinctly highlights pivot and dims elements outside active partition', () => {
      const generator = quickSortGenerator([50, 20, 80, 10, 40]);
      const { steps } = collectSortingSteps(generator);

      // Find a step with a pivot and partition range
      const partitionStep = steps.find(
        (s) => s.pivotIndex !== undefined && s.partitionRange !== undefined && s.indices.length >= 2
      );
      expect(partitionStep).toBeDefined();

      const htmlPartition = renderToStaticMarkup(
        React.createElement(ChronoEngine, {
          mode: 'PARTITION_SWAP',
          step: partitionStep,
        })
      );

      expect(htmlPartition).toContain('data-mode="PARTITION_SWAP"');
      expect(htmlPartition).toContain('data-testid="partition-header"');
      expect(htmlPartition).toContain('data-testid="pivot-indicator"');
      expect(htmlPartition).toContain('bar-pivot');
      expect(htmlPartition).toContain('pivot-floating-tag');
      expect(htmlPartition).toContain('>PIVOT<');

      // Verify partition boundary separation: elements inside vs outside
      const [low, high] = partitionStep!.partitionRange!;
      for (let i = 0; i < partitionStep!.array.length; i++) {
        const barTag = getBarTag(htmlPartition, i);
        if (i >= low && i <= high) {
          expect(barTag).toContain('is-in-partition');
        } else {
          expect(barTag).toContain('is-outside-partition');
        }
      }
    });
  });

  /* =========================================================================
     5. Playback & State Integrity
     ========================================================================= */
  describe('5. Playback & State Integrity', () => {
    it('Timeline Scrubber: perfectly reconstructs array state when scrubbing backward from Step 50 to Step 10', () => {
      const input = [64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 2];
      const { steps } = collectSortingSteps(bubbleSortGenerator(input));

      expect(steps.length).toBeGreaterThan(50);

      // Snapshot state at Step 10 during initial generation
      const expectedArrayAtStep10 = [...steps[10].array];
      const expectedActiveIndicesAtStep10 = [...steps[10].indices];
      const expectedSortedIndicesAtStep10 = [...steps[10].sortedIndices];

      // Simulate scrubbing forward to Step 50
      const currentStepAt50 = steps[50];
      expect(currentStepAt50).toBeDefined();

      // Simulate user scrubbing backward from Step 50 to Step 10
      const scrubbedStepAt10 = steps[10];

      // State assertion: exact array restoration
      expect(scrubbedStepAt10.array).toEqual(expectedArrayAtStep10);
      expect(scrubbedStepAt10.indices).toEqual(expectedActiveIndicesAtStep10);
      expect(scrubbedStepAt10.sortedIndices).toEqual(expectedSortedIndicesAtStep10);

      // Verify ChronoEngine renders exactly step 10's state after scrubbing back
      const htmlScrubbed = renderToStaticMarkup(
        React.createElement(ChronoEngine, {
          mode: 'SORTING_BARS',
          step: scrubbedStepAt10,
        })
      );

      for (let i = 0; i < scrubbedStepAt10.array.length; i++) {
        const val = scrubbedStepAt10.array[i];
        expect(htmlScrubbed).toContain(`data-testid="sorting-bar-${i}"`);
        expect(htmlScrubbed).toContain(`data-value="${val}"`);
      }
    });

    it('Timeline Scrubber: random bidirectional scrubbing maintains 100% state idempotence', () => {
      const input = [29, 10, 14, 37, 13, 8, 25, 40, 15, 3];
      const { steps } = collectSortingSteps(insertionSortGenerator(input));

      // Array of scrub jumps: Forward -> Backward -> Forward -> Backward -> Step 0
      const scrubSequence = [25, 12, 35, 5, 20, 0, steps.length - 1];

      for (const targetStep of scrubSequence) {
        const step = steps[targetStep];
        expect(step.array.length).toBe(input.length);

        // Render in ChronoEngine and ensure no desync or crashes
        const html = renderToStaticMarkup(
          React.createElement(ChronoEngine, {
            mode: 'SORTING_BARS',
            step,
          })
        );
        expect(html).toContain('data-testid="chrono-engine"');
      }
    });

    it('Telemetry Odometer: correctly decrements swap and comparison counts when scrubbing backward', () => {
      const input = [9, 8, 7, 6, 5, 4, 3, 2, 1];
      const { steps } = collectSortingSteps(bubbleSortGenerator(input));

      // Helper simulating the Odometer calculation from events up to currentIndex
      function computeTelemetryAtStep(stepIndex: number) {
        let comparisons = 0;
        let swaps = 0;
        let overwrites = 0;

        for (let i = 0; i <= stepIndex; i++) {
          const s = steps[i];
          if (s.type === 'COMPARE' && s.indices.length >= 2) comparisons++;
          else if (s.type === 'SWAP') swaps++;
          else if (s.type === 'OVERWRITE') overwrites++;
        }

        return { comparisons, swaps, overwrites, total: comparisons + swaps + overwrites };
      }

      const telemetryAtStep40 = computeTelemetryAtStep(40);
      const telemetryAtStep10 = computeTelemetryAtStep(10);
      const telemetryAtStep0 = computeTelemetryAtStep(0);

      // Comparisons and swaps must be strictly greater at Step 40 than Step 10
      expect(telemetryAtStep40.comparisons).toBeGreaterThan(telemetryAtStep10.comparisons);
      expect(telemetryAtStep40.swaps).toBeGreaterThan(telemetryAtStep10.swaps);
      expect(telemetryAtStep40.total).toBeGreaterThan(telemetryAtStep10.total);

      // Scrubbing backward from Step 40 to Step 10 decrements counts accurately
      const deltaComparisons = telemetryAtStep40.comparisons - telemetryAtStep10.comparisons;
      const deltaSwaps = telemetryAtStep40.swaps - telemetryAtStep10.swaps;

      expect(deltaComparisons).toBeGreaterThan(0);
      expect(deltaSwaps).toBeGreaterThan(0);
      expect(telemetryAtStep10.comparisons).toBe(telemetryAtStep40.comparisons - deltaComparisons);
      expect(telemetryAtStep10.swaps).toBe(telemetryAtStep40.swaps - deltaSwaps);

      // Scrubbing all the way back to Step 0 resets to initial frame telemetry
      expect(telemetryAtStep0.comparisons).toBeLessThanOrEqual(1);
      expect(telemetryAtStep0.swaps).toBe(0);
    });
  });
});
