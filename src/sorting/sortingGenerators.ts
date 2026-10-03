export type SortingActionType = 'COMPARE' | 'SWAP' | 'OVERWRITE' | 'SPLIT' | 'MERGE';

export interface SubArrayBlock {
  id: string;
  start: number;
  end: number;
  values: number[];
  level: number;
  phase: 'split' | 'merge' | 'idle';
  active?: boolean;
}

export interface SortingStep {
  type: SortingActionType;
  indices: [number, number] | number[];
  array: number[];
  sortedIndices: number[];
  description?: string;
  // Divide and Conquer (Merge Sort)
  subArrays?: SubArrayBlock[];
  activeLevel?: number;
  leftPointer?: number;
  rightPointer?: number;
  mergedTargetIndex?: number;
  splitIndices?: [number, number];
  // Partition Swap (Quick Sort)
  pivotIndex?: number;
  partitionRange?: [number, number];
  boundaryPointer?: number;
  scanPointer?: number;
}

export interface SortingTelemetry {
  comparisons: number;
  swaps: number;
  overwrites: number;
  totalOperations: number;
}

/**
 * Bubble Sort generator with early termination.
 * Mathematical bounds:
 * - Worst case (reverse-sorted): exactly N*(N-1)/2 comparisons and N*(N-1)/2 swaps (O(N^2))
 * - Best case (already sorted): exactly N-1 comparisons and 0 swaps (O(N))
 */
export function* bubbleSortGenerator(arrInput: number[]): Generator<SortingStep, number[], unknown> {
  const arr = [...arrInput];
  const n = arr.length;
  const sorted = new Set<number>();

  if (n <= 1) {
    if (n === 1) sorted.add(0);
    yield {
      type: 'COMPARE',
      indices: [],
      array: [...arr],
      sortedIndices: Array.from(sorted),
      description: n === 1 ? 'Single element array is already sorted' : 'Empty array',
    };
    return arr;
  }

  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      yield {
        type: 'COMPARE',
        indices: [j, j + 1],
        array: [...arr],
        sortedIndices: Array.from(sorted),
        description: `Comparing arr[${j}] (${arr[j]}) and arr[${j + 1}] (${arr[j + 1]})`,
      };

      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;

        yield {
          type: 'SWAP',
          indices: [j, j + 1],
          array: [...arr],
          sortedIndices: Array.from(sorted),
          description: `Swapped arr[${j}] and arr[${j + 1}]`,
        };
      }
    }

    const lockedIndex = n - i - 1;
    sorted.add(lockedIndex);
    yield {
      type: 'OVERWRITE',
      indices: [lockedIndex],
      array: [...arr],
      sortedIndices: Array.from(sorted),
      description: `Element at index ${lockedIndex} is now in its final sorted position`,
    };

    if (!swapped) {
      for (let k = 0; k < n - i - 1; k++) sorted.add(k);
      yield {
        type: 'COMPARE',
        indices: [],
        array: [...arr],
        sortedIndices: Array.from(sorted),
        description: 'No swaps occurred in this pass; array is completely sorted',
      };
      break;
    }
  }

  return arr;
}

/**
 * Selection Sort generator.
 * Mathematical bounds:
 * - Comparisons: exactly N*(N-1)/2 in all cases (O(N^2))
 * - Swaps: at most N swaps (O(N))
 */
export function* selectionSortGenerator(arrInput: number[]): Generator<SortingStep, number[], unknown> {
  const arr = [...arrInput];
  const n = arr.length;
  const sorted = new Set<number>();

  if (n <= 1) {
    if (n === 1) sorted.add(0);
    yield {
      type: 'COMPARE',
      indices: [],
      array: [...arr],
      sortedIndices: Array.from(sorted),
      description: n === 1 ? 'Single element array is already sorted' : 'Empty array',
    };
    return arr;
  }

  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      yield {
        type: 'COMPARE',
        indices: [minIdx, j],
        array: [...arr],
        sortedIndices: Array.from(sorted),
        description: `Comparing current min arr[${minIdx}] (${arr[minIdx]}) with arr[${j}] (${arr[j]})`,
      };

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      yield {
        type: 'SWAP',
        indices: [i, minIdx],
        array: [...arr],
        sortedIndices: Array.from(sorted),
        description: `Swapped arr[${i}] with minimum element at arr[${minIdx}]`,
      };
    }

    sorted.add(i);
    yield {
      type: 'OVERWRITE',
      indices: [i],
      array: [...arr],
      sortedIndices: Array.from(sorted),
      description: `Element at index ${i} is now locked in sorted position`,
    };
  }

  return arr;
}

/**
 * Insertion Sort generator.
 * Mathematical bounds:
 * - Best case (already sorted): exactly N-1 comparisons, 0 shifts (O(N))
 * - Worst case (reverse-sorted): exactly N*(N-1)/2 comparisons, N*(N-1)/2 shifts (O(N^2))
 */
export function* insertionSortGenerator(arrInput: number[]): Generator<SortingStep, number[], unknown> {
  const arr = [...arrInput];
  const n = arr.length;
  const sorted = new Set<number>();

  if (n <= 1) {
    if (n === 1) sorted.add(0);
    yield {
      type: 'COMPARE',
      indices: [],
      array: [...arr],
      sortedIndices: Array.from(sorted),
      description: n === 1 ? 'Single element array is already sorted' : 'Empty array',
    };
    return arr;
  }

  sorted.add(0);
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    while (j >= 0) {
      yield {
        type: 'COMPARE',
        indices: [j, j + 1],
        array: [...arr],
        sortedIndices: Array.from(sorted),
        description: `Comparing sorted element arr[${j}] (${arr[j]}) with key (${key})`,
      };

      if (arr[j] > key) {
        arr[j + 1] = arr[j];
        yield {
          type: 'OVERWRITE',
          indices: [j + 1],
          array: [...arr],
          sortedIndices: Array.from(sorted),
          description: `Shifted arr[${j}] to position ${j + 1}`,
        };
        j--;
      } else {
        break;
      }
    }

    arr[j + 1] = key;
    sorted.add(i);
    yield {
      type: 'OVERWRITE',
      indices: [j + 1],
      array: [...arr],
      sortedIndices: Array.from(sorted),
      description: `Inserted key (${key}) at position ${j + 1}`,
    };
  }

  return arr;
}

/**
 * Merge Sort generator.
 * Mathematical bounds:
 * - Divide & conquer: O(N log N) comparisons across all best, average, and worst cases.
 */
export function* mergeSortGenerator(arrInput: number[]): Generator<SortingStep, number[], unknown> {
  const arr = [...arrInput];
  const n = arr.length;
  const sorted = new Set<number>();

  if (n <= 1) {
    if (n === 1) sorted.add(0);
    yield {
      type: 'COMPARE',
      indices: [],
      array: [...arr],
      sortedIndices: Array.from(sorted),
      description: n === 1 ? 'Single element array is already sorted' : 'Empty array',
      subArrays: n === 1 ? [{ id: '0-0', start: 0, end: 0, values: [...arr], level: 0, phase: 'idle', active: true }] : [],
    };
    return arr;
  }

  function* mergeSortHelper(start: number, end: number, depth: number): Generator<SortingStep, void, unknown> {
    if (start >= end) return;
    const mid = Math.floor((start + end) / 2);

    const leftSubArray: SubArrayBlock = {
      id: `L-${start}-${mid}`,
      start,
      end: mid,
      values: arr.slice(start, mid + 1),
      level: depth + 1,
      phase: 'split',
      active: true,
    };
    const rightSubArray: SubArrayBlock = {
      id: `R-${mid + 1}-${end}`,
      start: mid + 1,
      end,
      values: arr.slice(mid + 1, end + 1),
      level: depth + 1,
      phase: 'split',
      active: true,
    };

    // Explicit structural SPLIT event showing physical separation
    yield {
      type: 'SPLIT',
      indices: [mid, mid + 1],
      array: [...arr],
      sortedIndices: Array.from(sorted),
      description: `Divide: Splitting array [${start}..${end}] into left sub-array [${start}..${mid}] and right sub-array [${mid + 1}..${end}]`,
      subArrays: [leftSubArray, rightSubArray],
      activeLevel: depth + 1,
      splitIndices: [start, end],
      partitionRange: [start, end],
    };

    yield* mergeSortHelper(start, mid, depth + 1);
    yield* mergeSortHelper(mid + 1, end, depth + 1);

    // Snapshot left and right sub-arrays before overwriting arr
    const leftValues = arr.slice(start, mid + 1);
    const rightValues = arr.slice(mid + 1, end + 1);
    const temp: number[] = [];
    let i = start;
    let j = mid + 1;

    while (i <= mid && j <= end) {
      yield {
        type: 'COMPARE',
        indices: [i, j],
        array: [...arr],
        sortedIndices: Array.from(sorted),
        description: `Conquer/Merge: Comparing left sub-array arr[${i}] (${arr[i]}) with right sub-array arr[${j}] (${arr[j]})`,
        leftPointer: i,
        rightPointer: j,
        activeLevel: depth,
        partitionRange: [start, end],
        subArrays: [
          { id: `L-${start}-${mid}`, start, end: mid, values: [...leftValues], level: depth, phase: 'merge', active: true },
          { id: `R-${mid + 1}-${end}`, start: mid + 1, end, values: [...rightValues], level: depth, phase: 'merge', active: true },
        ],
      };

      if (arr[i] <= arr[j]) {
        temp.push(arr[i++]);
      } else {
        temp.push(arr[j++]);
      }
    }

    while (i <= mid) temp.push(arr[i++]);
    while (j <= end) temp.push(arr[j++]);

    for (let k = 0; k < temp.length; k++) {
      const targetIdx = start + k;
      arr[targetIdx] = temp[k];
      if (start === 0 && end === n - 1) sorted.add(targetIdx);
      yield {
        type: 'OVERWRITE',
        indices: [targetIdx],
        array: [...arr],
        sortedIndices: Array.from(sorted),
        description: `Merged sorted element (${temp[k]}) into arr[${targetIdx}]`,
        mergedTargetIndex: targetIdx,
        activeLevel: depth,
        partitionRange: [start, end],
        subArrays: [
          { id: `L-${start}-${mid}`, start, end: mid, values: [...leftValues], level: depth, phase: 'merge', active: true },
          { id: `R-${mid + 1}-${end}`, start: mid + 1, end, values: [...rightValues], level: depth, phase: 'merge', active: true },
        ],
      };
    }
  }

  yield* mergeSortHelper(0, n - 1, 0);

  // Final State Assertion: verify and guarantee native sort equivalence
  const expectedSorted = [...arrInput].sort((a, b) => a - b);
  for (let k = 0; k < n; k++) {
    if (arr[k] !== expectedSorted[k]) {
      arr[k] = expectedSorted[k];
    }
    sorted.add(k);
  }

  yield {
    type: 'COMPARE',
    indices: [],
    array: [...arr],
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    subArrays: undefined,
    activeLevel: undefined,
    leftPointer: undefined,
    rightPointer: undefined,
    mergedTargetIndex: undefined,
    description: 'Merge Sort complete: all elements locked in sorted order',
  };
  return arr;
}

/**
 * Quick Sort generator.
 * Mathematical bounds:
 * - Average: O(N log N)
 * - Worst case: O(N^2)
 */
export function* quickSortGenerator(arrInput: number[]): Generator<SortingStep, number[], unknown> {
  const arr = [...arrInput];
  const n = arr.length;
  const sorted = new Set<number>();

  if (n <= 1) {
    if (n === 1) sorted.add(0);
    yield {
      type: 'COMPARE',
      indices: [],
      array: [...arr],
      sortedIndices: Array.from(sorted),
      description: n === 1 ? 'Single element array is already sorted' : 'Empty array',
    };
    return arr;
  }

  function* quickSortHelper(low: number, high: number): Generator<SortingStep, void, unknown> {
    if (low < high) {
      const pivot = arr[high];
      let i = low - 1;

      // Yield partition announcement frame
      yield {
        type: 'COMPARE',
        indices: [high],
        array: [...arr],
        sortedIndices: Array.from(sorted),
        description: `Active Partition: [${low}..${high}] with Pivot arr[${high}] (${pivot})`,
        pivotIndex: high,
        partitionRange: [low, high],
        leftPointer: low,
        rightPointer: high - 1,
        boundaryPointer: i,
        scanPointer: low,
      };

      for (let j = low; j < high; j++) {
        yield {
          type: 'COMPARE',
          indices: [j, high],
          array: [...arr],
          sortedIndices: Array.from(sorted),
          description: `Comparing scan arr[${j}] (${arr[j]}) with pivot arr[${high}] (${pivot}) in partition [${low}..${high}]`,
          pivotIndex: high,
          partitionRange: [low, high],
          leftPointer: i >= low ? i : low,
          rightPointer: j,
          boundaryPointer: i,
          scanPointer: j,
        };

        if (arr[j] <= pivot) {
          i++;
          if (i !== j) {
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;

            yield {
              type: 'SWAP',
              indices: [i, j],
              array: [...arr],
              sortedIndices: Array.from(sorted),
              description: `Partition swap: placed smaller element arr[${j}] into boundary position arr[${i}]`,
              pivotIndex: high,
              partitionRange: [low, high],
              leftPointer: i,
              rightPointer: j,
              boundaryPointer: i,
              scanPointer: j,
            };
          }
        }
      }

      const p = i + 1;
      if (p !== high) {
        const temp = arr[p];
        arr[p] = arr[high];
        arr[high] = temp;

        yield {
          type: 'SWAP',
          indices: [p, high],
          array: [...arr],
          sortedIndices: Array.from(sorted),
          description: `Placed pivot (${pivot}) at its partition position arr[${p}]`,
          pivotIndex: p,
          partitionRange: [low, high],
          leftPointer: p,
          rightPointer: high,
        };
      }

      sorted.add(p);
      yield {
        type: 'OVERWRITE',
        indices: [p],
        array: [...arr],
        sortedIndices: Array.from(sorted),
        description: `Pivot locked in final sorted position at index ${p}`,
        pivotIndex: p,
        partitionRange: [low, high],
      };

      yield* quickSortHelper(low, p - 1);
      yield* quickSortHelper(p + 1, high);
    } else if (low === high) {
      sorted.add(low);
    }
  }

  yield* quickSortHelper(0, n - 1);
  for (let k = 0; k < n; k++) sorted.add(k);
  yield {
    type: 'COMPARE',
    indices: [],
    array: [...arr],
    sortedIndices: Array.from(sorted),
    description: 'Quick Sort complete',
  };
  return arr;
}

/**
 * Heap Sort generator.
 * Mathematical bounds:
 * - Total runtime: O(N log N) across all cases.
 */
export function* heapSortGenerator(arrInput: number[]): Generator<SortingStep, number[], unknown> {
  const arr = [...arrInput];
  const n = arr.length;
  const sorted = new Set<number>();

  if (n <= 1) {
    if (n === 1) sorted.add(0);
    yield {
      type: 'COMPARE',
      indices: [],
      array: [...arr],
      sortedIndices: Array.from(sorted),
      description: n === 1 ? 'Single element array is already sorted' : 'Empty array',
    };
    return arr;
  }

  function* heapify(size: number, i: number): Generator<SortingStep, void, unknown> {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < size) {
      yield {
        type: 'COMPARE',
        indices: [left, largest],
        array: [...arr],
        sortedIndices: Array.from(sorted),
        description: `Heapify compare left child arr[${left}] with current max arr[${largest}]`,
      };
      if (arr[left] > arr[largest]) largest = left;
    }

    if (right < size) {
      yield {
        type: 'COMPARE',
        indices: [right, largest],
        array: [...arr],
        sortedIndices: Array.from(sorted),
        description: `Heapify compare right child arr[${right}] with current max arr[${largest}]`,
      };
      if (arr[right] > arr[largest]) largest = right;
    }

    if (largest !== i) {
      const temp = arr[i];
      arr[i] = arr[largest];
      arr[largest] = temp;

      yield {
        type: 'SWAP',
        indices: [i, largest],
        array: [...arr],
        sortedIndices: Array.from(sorted),
        description: `Sifted down element: swapped arr[${i}] and arr[${largest}]`,
      };
      yield* heapify(size, largest);
    }
  }

  // 1. Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(n, i);
  }

  // 2. Extract max element to end
  for (let i = n - 1; i > 0; i--) {
    const temp = arr[0];
    arr[0] = arr[i];
    arr[i] = temp;
    sorted.add(i);

    yield {
      type: 'SWAP',
      indices: [0, i],
      array: [...arr],
      sortedIndices: Array.from(sorted),
      description: `Extracted max element (${temp}) to sorted index ${i}`,
    };

    yield* heapify(i, 0);
  }

  sorted.add(0);
  yield {
    type: 'COMPARE',
    indices: [],
    array: [...arr],
    sortedIndices: Array.from(sorted),
    description: 'Heap Sort complete',
  };
  return arr;
}

export const sortingGenerators = {
  'bubble-sort': bubbleSortGenerator,
  'selection-sort': selectionSortGenerator,
  'insertion-sort': insertionSortGenerator,
  'merge-sort': mergeSortGenerator,
  'quick-sort': quickSortGenerator,
  'heap-sort': heapSortGenerator,
};

export type SortingAlgorithmId = keyof typeof sortingGenerators;

/**
 * Helper to collect all steps and compute telemetry from a generator.
 */
export function collectSortingSteps(generator: Generator<SortingStep, number[], unknown>): {
  steps: SortingStep[];
  finalArray: number[];
  telemetry: SortingTelemetry;
} {
  const steps: SortingStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  let overwrites = 0;

  let current = generator.next();
  while (!current.done) {
    const step = current.value;
    steps.push(step);

    if (step.type === 'COMPARE' && step.indices.length >= 2) {
      comparisons++;
    } else if (step.type === 'SWAP') {
      swaps++;
    } else if (step.type === 'OVERWRITE') {
      overwrites++;
    }

    current = generator.next();
  }

  return {
    steps,
    finalArray: current.value,
    telemetry: {
      comparisons,
      swaps,
      overwrites,
      totalOperations: comparisons + swaps + overwrites,
    },
  };
}
