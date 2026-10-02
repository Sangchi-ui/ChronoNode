import type { AlgorithmData } from './types';

export const searchingAlgorithms: AlgorithmData[] = [
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'Searching Algorithms',
    complexity: { time: 'O(N)', space: 'O(1)' },
    explanation: 'Sequentially checks each element of a list in order until a match is found or the end of the collection is reached.',
    realWorldExample: 'Flipping through a stack of unsorted papers one by one from top to bottom until you locate a specific document.',
    stepByStepLogic: [
      '1. Start at the first element (index 0).',
      '2. Compare the current item with the target value.',
      '3. If they match, return the current index.',
      '4. Otherwise, advance to the next element and repeat until the end.',
      '5. Return -1 if the target is not present.'
    ],
    pythonCode: `# Linear Search
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

values = [4, 9, 2, 7, 5, 8]
result = linear_search(values, 7)
print("Found at index:", result)
`
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching Algorithms',
    complexity: { time: 'O(log N)', space: 'O(1)' },
    explanation: 'A divide-and-conquer search algorithm that repeatedly halves a sorted array to locate a target key in logarithmic time.',
    realWorldExample: 'Opening a physical dictionary right in the middle, seeing if your word comes before or after, and discarding half the book each time.',
    stepByStepLogic: [
      '1. Initialize two pointers: left = 0 and right = len(arr) - 1.',
      '2. Calculate the middle index: mid = (left + right) // 2.',
      '3. If arr[mid] equals target, return mid.',
      '4. If arr[mid] < target, narrow the search to the right half (left = mid + 1).',
      '5. If arr[mid] > target, narrow the search to the left half (right = mid - 1).',
      '6. Repeat while left <= right. Return -1 if not found.'
    ],
    pythonCode: `# Binary Search
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

values = [2, 5, 8, 12, 16, 23, 38, 56, 72]
result = binary_search(values, 23)
print("Found at index:", result)
`
  },
  {
    id: 'ternary-search',
    name: 'Ternary Search',
    category: 'Searching Algorithms',
    complexity: { time: 'O(log3 N)', space: 'O(1)' },
    explanation: 'Divides a sorted array into three equal parts using two midpoints (mid1 and mid2), eliminating two-thirds of candidates in each step.',
    realWorldExample: 'Dividing a long road into three equal segments and placing checkpoints at the 1/3 and 2/3 marks to quickly isolate where a car broke down.',
    stepByStepLogic: [
      '1. Compute two midpoints: mid1 = left + (right - left) // 3 and mid2 = right - (right - left) // 3.',
      '2. Check if target matches either arr[mid1] or arr[mid2].',
      '3. If target < arr[mid1], search the left third (right = mid1 - 1).',
      '4. If target > arr[mid2], search the right third (left = mid2 + 1).',
      '5. Otherwise, search the middle third (left = mid1 + 1, right = mid2 - 1).',
      '6. Repeat while left <= right.'
    ],
    pythonCode: `# Ternary Search
def ternary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid1 = left + (right - left) // 3
        mid2 = right - (right - left) // 3
        if arr[mid1] == target:
            return mid1
        if arr[mid2] == target:
            return mid2
        if target < arr[mid1]:
            right = mid1 - 1
        elif target > arr[mid2]:
            left = mid2 + 1
        else:
            left = mid1 + 1
            right = mid2 - 1
    return -1

values = [1, 4, 7, 10, 15, 20, 25, 30]
result = ternary_search(values, 20)
print("Found at index:", result)
`
  },
  {
    id: 'jump-search',
    name: 'Jump Search',
    category: 'Searching Algorithms',
    complexity: { time: 'O(√N)', space: 'O(1)' },
    explanation: 'Checks fewer elements in a sorted array by jumping ahead by fixed blocks of size √N, then performing linear search backwards inside the block.',
    realWorldExample: 'Skimming an encyclopedia volume by jumping 10 pages forward at a time until you overshoot your subject, then stepping backward page by page.',
    stepByStepLogic: [
      '1. Calculate optimal jump step size: step = int(sqrt(n)).',
      '2. Jump forward in increments of step while arr[step] < target.',
      '3. Once an upper boundary is reached, identify the block [prev, min(step, n)].',
      '4. Perform a linear search within that block.',
      '5. Return the index if found, or -1 if the element does not exist.'
    ],
    pythonCode: `# Jump Search
import math

def jump_search(arr, target):
    n = len(arr)
    step = int(math.isqrt(n))
    prev = 0
    while step < n and arr[min(step, n) - 1] < target:
        prev = step
        step += int(math.isqrt(n))
    for i in range(prev, min(step, n)):
        if arr[i] == target:
            return i
    return -1

values = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
result = jump_search(values, 55)
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
