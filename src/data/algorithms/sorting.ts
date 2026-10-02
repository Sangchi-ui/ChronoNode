import type { AlgorithmData } from './types';

export const sortingAlgorithms: AlgorithmData[] = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N²)', space: 'O(1)' },
    explanation: 'A comparison-based sort that repeatedly steps through the list, swaps adjacent elements that are out of order, bubbling larger values to the end.',
    realWorldExample: 'Air bubbles in water floating naturally to the surface one by one according to their volume and buoyancy.',
    stepByStepLogic: [
      '1. Loop through the array from end to 1.',
      '2. In an inner loop, compare adjacent pairs arr[i] and arr[i + 1].',
      '3. If arr[i] > arr[i + 1], swap them.',
      '4. Maintain a flag to break early if no swaps occurred during a pass.',
      '5. Continue until the entire array is sorted.'
    ],
    pythonCode: `# Bubble Sort
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr

items = [64, 34, 25, 12, 22, 11, 90]
print(bubble_sort(items))
`
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N²)', space: 'O(1)' },
    explanation: 'Divides the array into sorted and unsorted subarrays; continuously finds the minimum element from the unsorted region and appends it to the sorted region.',
    realWorldExample: 'Selecting the shortest person in a crowd to stand first in line, then selecting the next shortest person, repeating until everyone is ordered.',
    stepByStepLogic: [
      '1. Iterate index i from 0 to n - 1.',
      '2. Assume index i holds the minimum value (min_idx = i).',
      '3. Scan all indices j > i to find if any element is smaller than arr[min_idx].',
      '4. If a smaller element is discovered, update min_idx = j.',
      '5. Swap arr[i] with arr[min_idx] at the end of each pass.'
    ],
    pythonCode: `# Selection Sort
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

items = [29, 10, 14, 37, 13]
print(selection_sort(items))
`
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N²)', space: 'O(1)' },
    explanation: 'Builds the final sorted array one item at a time by consuming one input element each repetition and inserting it into its correct position among already-sorted elements.',
    realWorldExample: 'Sorting playing cards in your hand by picking up one card at a time and sliding it into its proper position among the sorted cards.',
    stepByStepLogic: [
      '1. Start at index 1 and store key = arr[i].',
      '2. Compare key with elements in the sorted portion (indices 0 to i - 1).',
      '3. Shift elements greater than key one position to the right.',
      '4. Insert key into its correct empty slot.',
      '5. Repeat for all elements from index 1 to n - 1.'
    ],
    pythonCode: `# Insertion Sort
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

items = [12, 11, 13, 5, 6]
print(insertion_sort(items))
`
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N log N)', space: 'O(N)' },
    explanation: 'An efficient, stable, divide-and-conquer algorithm that recursively splits an array in half until singletons, then merges the sorted halves back together.',
    realWorldExample: 'Splitting two large stacks of graded exam papers between two assistants to sort individually, then merging the two sorted stacks in order.',
    stepByStepLogic: [
      '1. Check base case: if length <= 1, the list is already sorted.',
      '2. Find midpoint mid = len(arr) // 2 and recursively merge-sort left and right halves.',
      '3. Merge the two sorted subarrays by comparing leading elements and copying the smaller one.',
      '4. Append any remaining elements from either subarray.',
      '5. Return the combined sorted array.'
    ],
    pythonCode: `# Merge Sort
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged

items = [38, 27, 43, 3, 9, 82, 10]
print(merge_sort(items))
`
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N log N) avg / O(N²) worst', space: 'O(log N)' },
    explanation: 'Selects a pivot element and partitions array into values less than the pivot and values greater than the pivot, then recursively sorts the sub-partitions in place.',
    realWorldExample: 'Organizing students into two groups by choosing a benchmark height, having shorter students step to the left and taller to the right, then repeating for each group.',
    stepByStepLogic: [
      '1. Choose a pivot element (e.g. the last element arr[high]).',
      '2. Rearrange the array: place elements smaller than pivot to the left and larger to the right.',
      '3. Place the pivot into its final sorted position.',
      '4. Recursively apply Quick Sort to the left partition.',
      '5. Recursively apply Quick Sort to the right partition.'
    ],
    pythonCode: `# Quick Sort
def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        pivot = arr[high]
        i = low - 1
        for j in range(low, high):
            if arr[j] <= pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        p = i + 1
        quick_sort(arr, low, p - 1)
        quick_sort(arr, p + 1, high)
    return arr

items = [10, 80, 30, 90, 40, 50, 70]
print(quick_sort(items))
`
  },
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N log N)', space: 'O(1)' },
    explanation: 'Converts an array into a Max-Heap data structure, repeatedly extracts the maximum root element to the end of the array, and sifts down to restore heap property.',
    realWorldExample: 'A corporate tournament where the top contender is crowned, steps off the stage into retirement, and remaining contestants duel to determine the next top contender.',
    stepByStepLogic: [
      '1. Build a max heap from the unsorted array.',
      '2. Swap the root (maximum element) with the last element of the heap.',
      '3. Reduce the heap size by 1.',
      '4. Heapify the root element down to its valid position.',
      '5. Repeat until the heap size reduces to 1.'
    ],
    pythonCode: `# Heap Sort
def heapify(arr, n, i):
    largest = i
    l = 2 * i + 1
    r = 2 * i + 2
    if l < n and arr[l] > arr[largest]:
        largest = l
    if r < n and arr[r] > arr[largest]:
        largest = r
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        heapify(arr, i, 0)
    return arr

items = [12, 11, 13, 5, 6, 7]
print(heap_sort(items))
`
  },
  {
    id: 'radix-sort',
    name: 'Radix Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(D · (N + B))', space: 'O(N + B)' },
    explanation: 'A non-comparative sorting algorithm that sorts numbers digit by digit, from the least significant digit (LSD) to the most significant digit (MSD) using a stable sub-sort.',
    realWorldExample: 'Sorting index cards by zip code: first sorting by the last digit into 10 bins, collecting them in order, then sorting by the 4th digit, and so on.',
    stepByStepLogic: [
      '1. Find the maximum number in the array to determine total number of digits.',
      '2. Set exponent exp = 1 (representing 1s place).',
      '3. Use stable Counting Sort to sort array elements by the digit at current exp.',
      '4. Multiply exp by 10 to advance to the next digit position.',
      '5. Continue until all digits have been processed.'
    ],
    pythonCode: `# Radix Sort (LSD)
def counting_sort_digit(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    for num in arr:
        index = (num // exp) % 10
        count[index] += 1
    for i in range(1, 10):
        count[i] += count[i - 1]
    for i in range(n - 1, -1, -1):
        index = (arr[i] // exp) % 10
        output[count[index] - 1] = arr[i]
        count[index] -= 1
    for i in range(n):
        arr[i] = output[i]

def radix_sort(arr):
    if not arr:
        return arr
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        counting_sort_digit(arr, exp)
        exp *= 10
    return arr

items = [170, 45, 75, 90, 802, 24, 2, 66]
print(radix_sort(items))
`
  },
  {
    id: 'counting-sort',
    name: 'Counting Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N + K)', space: 'O(K)' },
    explanation: 'Sorts integers within a known range by counting occurrences of each distinct key, computing prefix sums for positions, and mapping elements directly to output.',
    realWorldExample: 'Tallying votes in an election with 5 candidates by putting checkmarks in 5 columns, then writing out the ballots in alphabetical order based on totals.',
    stepByStepLogic: [
      '1. Find maximum value k in the array and allocate count array of size k + 1.',
      '2. Iterate through input elements, incrementing count[x].',
      '3. Transform count into prefix sums: count[i] += count[i - 1].',
      '4. Iterate input array in reverse, placing elements into output at index count[x] - 1.',
      '5. Decrement count[x] for stability.'
    ],
    pythonCode: `# Counting Sort
def counting_sort(arr):
    if not arr:
        return arr
    min_val, max_val = min(arr), max(arr)
    range_val = max_val - min_val + 1
    count = [0] * range_val
    output = [0] * len(arr)
    for num in arr:
        count[num - min_val] += 1
    for i in range(1, len(count)):
        count[i] += count[i - 1]
    for num in reversed(arr):
        output[count[num - min_val] - 1] = num
        count[num - min_val] -= 1
    return output

items = [4, 2, 2, 8, 3, 3, 1]
print(counting_sort(items))
`
  },
  {
    id: 'bucket-sort',
    name: 'Bucket Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N + K) avg / O(N²) worst', space: 'O(N + K)' },
    explanation: 'Partitions elements into uniformly spaced buckets, sorts each bucket individually (often using insertion sort), and concatenates the buckets in order.',
    realWorldExample: 'Sorting mail by postal code into postal sorting slots, sorting each slot by street name, and finally packing them sequentially into delivery trucks.',
    stepByStepLogic: [
      '1. Create k empty buckets.',
      '2. Scatter each element into its corresponding bucket based on normalized value.',
      '3. Sort each individual bucket using an algorithm like insertion sort.',
      '4. Gather all elements from the buckets in order.',
      '5. Return the concatenated sorted array.'
    ],
    pythonCode: `# Bucket Sort
def bucket_sort(arr):
    if not arr:
        return arr
    bucket_count = 5
    min_val, max_val = min(arr), max(arr)
    range_val = (max_val - min_val) / bucket_count + 1e-9
    buckets = [[] for _ in range(bucket_count)]
    for num in arr:
        idx = int((num - min_val) / range_val)
        buckets[idx].append(num)
    sorted_arr = []
    for b in buckets:
        sorted_arr.extend(sorted(b))
    return sorted_arr

items = [0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434]
print(bucket_sort(items))
`
  },
  {
    id: 'shell-sort',
    name: 'Shell Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N log² N)', space: 'O(1)' },
    explanation: 'An optimization of insertion sort that compares and exchanges elements separated by a gradually shrinking gap sequence until gap = 1.',
    realWorldExample: 'Roughly arranging scattered books across a whole library by broad aisle categories first, before fine-tuning the exact title placement on each shelf.',
    stepByStepLogic: [
      '1. Initialize gap size: gap = n // 2.',
      '2. Perform gap-inserted sorting for all elements separated by gap.',
      '3. Reduce gap by dividing by 2.',
      '4. Repeat until gap reaches 0.',
      '5. The final pass with gap = 1 runs in nearly linear time on the pre-sorted list.'
    ],
    pythonCode: `# Shell Sort
def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2
    return arr

items = [12, 34, 54, 2, 3]
print(shell_sort(items))
`
  },
  {
    id: 'comb-sort',
    name: 'Comb Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N log N) avg / O(N²) worst', space: 'O(1)' },
    explanation: 'Improves Bubble Sort by comparing elements with a large gap and shrinking the gap by a shrink factor (approx 1.3) each pass to eliminate small values near the end (turtles).',
    realWorldExample: 'Using a wide-toothed comb first to untangle large knots in messy hair, then gradually switching to a finer comb for smooth brushing.',
    stepByStepLogic: [
      '1. Initialize gap = len(arr) and shrink factor = 1.3.',
      '2. Update gap = int(gap / 1.3); if gap < 1, set gap = 1.',
      '3. Compare and swap arr[i] and arr[i + gap] for all valid i.',
      '4. Continue until gap == 1 and no swaps occur in a full pass.'
    ],
    pythonCode: `# Comb Sort
def comb_sort(arr):
    n = len(arr)
    gap = n
    shrink = 1.3
    sorted_flag = False
    while not sorted_flag:
        gap = int(gap / shrink)
        if gap <= 1:
            gap = 1
            sorted_flag = True
        for i in range(n - gap):
            if arr[i] > arr[i + gap]:
                arr[i], arr[i + gap] = arr[i + gap], arr[i]
                sorted_flag = False
    return arr

items = [8, 4, 1, 56, 3, -44, 23, -6, 28, 0]
print(comb_sort(items))
`
  },
  {
    id: 'pigeonhole-sort',
    name: 'Pigeonhole Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N + Range)', space: 'O(Range)' },
    explanation: 'Suitable for sorting lists where number of elements and range of keys are approximately equal, moving elements into pigeonholes corresponding to their values.',
    realWorldExample: 'Sorting physical mail into a wall of named pigeonhole mailboxes in an office lobby, then collecting the mail sequentially from top-left to bottom-right.',
    stepByStepLogic: [
      '1. Find minimum and maximum values in array to determine range.',
      '2. Create an array of empty pigeonholes of size (max - min + 1).',
      '3. Place each element into pigeonholes[num - min].',
      '4. Iterate through pigeonholes and copy elements back into the original array.'
    ],
    pythonCode: `# Pigeonhole Sort
def pigeonhole_sort(arr):
    if not arr:
        return arr
    min_val, max_val = min(arr), max(arr)
    size = max_val - min_val + 1
    holes = [[] for _ in range(size)]
    for x in arr:
        holes[x - min_val].append(x)
    i = 0
    for hole in holes:
        for x in hole:
            arr[i] = x
            i += 1
    return arr

items = [8, 3, 2, 7, 4, 6, 8]
print(pigeonhole_sort(items))
`
  },
  {
    id: 'cycle-sort',
    name: 'Cycle Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N²)', space: 'O(1)' },
    explanation: 'An in-place, unstable sort that minimizes the total number of memory writes by decomposing the permutation into cycles and rotating elements directly to final slots.',
    realWorldExample: 'Trading seats at a dinner table by having one person stand up, finding who belongs in their chair, sitting that person down, and continuing the chain until the circle closes.',
    stepByStepLogic: [
      '1. Loop cycle_start from 0 to n - 2.',
      '2. Count how many elements are smaller than item = arr[cycle_start] to find correct pos.',
      '3. If item is already at pos, continue.',
      '4. Skip duplicate elements by incrementing pos.',
      '5. Put item in arr[pos] and take displaced element as new item.',
      '6. Repeat until the cycle returns to cycle_start.'
    ],
    pythonCode: `# Cycle Sort
def cycle_sort(arr):
    n = len(arr)
    for cycle_start in range(n - 1):
        item = arr[cycle_start]
        pos = cycle_start
        for i in range(cycle_start + 1, n):
            if arr[i] < item:
                pos += 1
        if pos == cycle_start:
            continue
        while item == arr[pos]:
            pos += 1
        arr[pos], item = item, arr[pos]
        while pos != cycle_start:
            pos = cycle_start
            for i in range(cycle_start + 1, n):
                if arr[i] < item:
                    pos += 1
            while item == arr[pos]:
                pos += 1
            arr[pos], item = item, arr[pos]
    return arr

items = [5, 2, 8, 3, 1]
print(cycle_sort(items))
`
  },
  {
    id: 'pancake-sort',
    name: 'Pancake Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N²)', space: 'O(1)' },
    explanation: 'Sorts an array using only prefix-reversal operations ("pancake flips"), repeatedly finding the maximum unsorted element, flipping it to index 0, then flipping it into place.',
    realWorldExample: 'Sorting a disordered stack of pancakes by diameter using a spatula inserted at any point to flip the top portion of the stack upside down.',
    stepByStepLogic: [
      '1. Start with the current size equal to the full array length.',
      '2. Find the index of the maximum element in arr[0...size - 1].',
      '3. If the maximum is not already at the end, flip the prefix to bring it to index 0.',
      '4. Flip the prefix of length size to move the maximum to its final position at size - 1.',
      '5. Decrement size and repeat until size == 1.'
    ],
    pythonCode: `# Pancake Sort
def flip(arr, k):
    left, right = 0, k
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1

def pancake_sort(arr):
    n = len(arr)
    for cur_size in range(n, 1, -1):
        max_idx = arr.index(max(arr[:cur_size]))
        if max_idx != cur_size - 1:
            if max_idx != 0:
                flip(arr, max_idx)
            flip(arr, cur_size - 1)
    return arr

items = [6, 7, 2, 1, 8, 3]
print(pancake_sort(items))
`
  },
  {
    id: 'timsort',
    name: 'TimSort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N log N)', space: 'O(N)' },
    explanation: 'A hybrid stable sorting algorithm derived from merge sort and insertion sort, dividing data into natural sorted runs and merging them efficiently. Default in Python and Java.',
    realWorldExample: 'Sorting a collection of files that people have already partially ordered in small folders, using insertion sort on tiny folders and merging adjacent folders.',
    stepByStepLogic: [
      '1. Partition input into small chunks ("runs") of size MIN_RUN (typically 32).',
      '2. Sort each run locally using Insertion Sort.',
      '3. Merge sorted runs pairwise using a balanced merge stack.',
      '4. Double run size in subsequent passes until the entire array is merged.'
    ],
    pythonCode: `# TimSort (Simplified Demonstration)
MIN_MERGE = 32

def insertion_sort_slice(arr, left, right):
    for i in range(left + 1, right + 1):
        temp = arr[i]
        j = i - 1
        while j >= left and arr[j] > temp:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = temp

def tim_sort(arr):
    n = len(arr)
    min_run = 4
    for i in range(0, n, min_run):
        insertion_sort_slice(arr, i, min(i + min_run - 1, n - 1))
    size = min_run
    while size < n:
        for left in range(0, n, 2 * size):
            mid = min(n - 1, left + size - 1)
            right = min(n - 1, left + 2 * size - 1)
            if mid < right:
                left_part = arr[left:mid + 1]
                right_part = arr[mid + 1:right + 1]
                i = j = 0
                k = left
                while i < len(left_part) and j < len(right_part):
                    if left_part[i] <= right_part[j]:
                        arr[k] = left_part[i]; i += 1
                    else:
                        arr[k] = right_part[j]; j += 1
                    k += 1
                while i < len(left_part): arr[k] = left_part[i]; i += 1; k += 1
                while j < len(right_part): arr[k] = right_part[j]; j += 1; k += 1
        size *= 2
    return arr

items = [5, 21, 7, 23, 19, 2, 8, 14, 1, 9]
print(tim_sort(items))
`
  },
  {
    id: 'cocktail-shaker-sort',
    name: 'Cocktail Shaker Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N²)', space: 'O(1)' },
    explanation: 'A bidirectional variation of Bubble Sort that traverses the list in both directions alternatingly: left-to-right to bubble up maximums, then right-to-left to bubble down minimums.',
    realWorldExample: 'A bartender shaking a cocktail shaker back and forth vigorously, causing ice and liquid to mix thoroughly from both directions.',
    stepByStepLogic: [
      '1. Scan forward from start to end, swapping adjacent out-of-order pairs.',
      '2. Decrement end since the largest element is placed.',
      '3. Scan backward from end to start, swapping adjacent out-of-order pairs.',
      '4. Increment start since the smallest element is placed.',
      '5. Repeat while start < end and swaps occurred.'
    ],
    pythonCode: `# Cocktail Shaker Sort
def cocktail_shaker_sort(arr):
    n = len(arr)
    swapped = True
    start = 0
    end = n - 1
    while swapped:
        swapped = False
        for i in range(start, end):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swapped = True
        if not swapped:
            break
        swapped = False
        end -= 1
        for i in range(end - 1, start - 1, -1):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swapped = True
        start += 1
    return arr

items = [5, 1, 4, 2, 8, 0, 2]
print(cocktail_shaker_sort(items))
`
  },
  {
    id: 'odd-even-sort',
    name: 'Odd-Even Sort (Brick Sort)',
    category: 'Sorting Algorithms',
    complexity: { time: 'O(N²)', space: 'O(1)' },
    explanation: 'A parallel sorting algorithm related to bubble sort, alternating between comparing odd-indexed pairs and even-indexed pairs until no swaps occur.',
    realWorldExample: 'A brick wall layout where mortar joints alternate in odd and even positions to distribute horizontal structural tension evenly.',
    stepByStepLogic: [
      '1. Set sorted = False.',
      '2. Odd phase: compare and swap adjacent pairs starting at odd indices (i = 1, 3, 5...).',
      '3. Even phase: compare and swap adjacent pairs starting at even indices (i = 0, 2, 4...).',
      '4. Repeat until both odd and even phases make zero swaps.'
    ],
    pythonCode: `# Odd-Even Sort (Brick Sort)
def odd_even_sort(arr):
    n = len(arr)
    is_sorted = False
    while not is_sorted:
        is_sorted = True
        # Odd phase
        for i in range(1, n - 1, 2):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                is_sorted = False
        # Even phase
        for i in range(0, n - 1, 2):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                is_sorted = False
    return arr

items = [34, 2, 10, -9]
print(odd_even_sort(items))
`
  },
  {
    id: 'bogo-sort',
    name: 'Bogo Sort',
    category: 'Sorting Algorithms',
    complexity: { time: 'O((N + 1)!) avg / O(∞) worst', space: 'O(1)' },
    explanation: 'A highly ineffective permutation-based algorithm that continuously shuffles the array randomly until it happens to be sorted.',
    realWorldExample: 'Throwing a deck of cards up into the air, picking them up off the floor, and checking if they landed in perfect sorted order.',
    stepByStepLogic: [
      '1. Check if the array is sorted.',
      '2. If sorted, return the array.',
      '3. Otherwise, shuffle the elements randomly.',
      '4. Repeat until the array happens to fall into sorted order.'
    ],
    pythonCode: `# Bogo Sort
import random

def is_sorted(arr):
    for i in range(len(arr) - 1):
        if arr[i] > arr[i + 1]:
            return False
    return True

def bogo_sort(arr):
    attempts = 0
    while not is_sorted(arr) and attempts < 100:
        random.shuffle(arr)
        attempts += 1
    return arr

items = [3, 1, 2]
print(bogo_sort(items))
`
  }
];
