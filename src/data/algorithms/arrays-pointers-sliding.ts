import type { AlgorithmData } from './types';

export const arrayPointerSlidingAlgorithms: AlgorithmData[] = [
  {
    id: 'kadanes-algorithm',
    name: 'Kadane’s Algorithm',
    category: 'Array, Two-Pointer, and Sliding Window Algorithms',
    complexity: { time: 'O(N)', space: 'O(1)' },
    explanation: 'Finds the maximum subarray sum in a 1D array of numbers by maintaining a current running sum and updating the global maximum at each position.',
    realWorldExample: 'Calculating the best streak of financial profits over consecutive days by tracking your ongoing balance and resetting when losses erase previous gains.',
    stepByStepLogic: [
      '1. Initialize max_so_far = arr[0] and current_max = arr[0].',
      '2. Iterate through elements from index 1 to n - 1.',
      '3. Update current_max = max(arr[i], current_max + arr[i]).',
      '4. Update max_so_far = max(max_so_far, current_max).',
      '5. Return max_so_far after completing the single pass.'
    ],
    pythonCode: `# Kadane's Algorithm
def max_subarray_sum(arr):
    max_so_far = arr[0]
    current_max = arr[0]
    for x in arr[1:]:
        current_max = max(x, current_max + x)
        max_so_far = max(max_so_far, current_max)
    return max_so_far

numbers = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print("Max Subarray Sum:", max_subarray_sum(numbers))
`
  },
  {
    id: 'dutch-national-flag',
    name: 'Dutch National Flag Algorithm',
    category: 'Array, Two-Pointer, and Sliding Window Algorithms',
    complexity: { time: 'O(N)', space: 'O(1)' },
    explanation: 'Partitions an array of three distinct values (e.g. 0s, 1s, and 2s) into three sorted sections in a single pass using three pointers (low, mid, high).',
    realWorldExample: 'Sorting laundry into three piles (whites, colors, darks) in a single pass using left, middle, and right staging hampers.',
    stepByStepLogic: [
      '1. Initialize low = 0, mid = 0, and high = n - 1.',
      '2. If arr[mid] == 0: swap arr[low] with arr[mid], increment low and mid.',
      '3. If arr[mid] == 1: increment mid.',
      '4. If arr[mid] == 2: swap arr[mid] with arr[high], decrement high.',
      '5. Repeat while mid <= high.'
    ],
    pythonCode: `# Dutch National Flag Algorithm
def sort_012(arr):
    low = 0
    mid = 0
    high = len(arr) - 1
    while mid <= high:
        if arr[mid] == 0:
            arr[low], arr[mid] = arr[mid], arr[low]
            low += 1
            mid += 1
        elif arr[mid] == 1:
            mid += 1
        else:
            arr[mid], arr[high] = arr[high], arr[mid]
            high -= 1
    return arr

balls = [2, 0, 2, 1, 1, 0]
print(sort_012(balls))
`
  },
  {
    id: 'boyer-moore-majority-vote',
    name: 'Boyer-Moore Majority Vote Algorithm',
    category: 'Array, Two-Pointer, and Sliding Window Algorithms',
    complexity: { time: 'O(N)', space: 'O(1)' },
    explanation: 'Finds the element that appears strictly more than ⌊n / 2⌋ times in linear time and constant auxiliary memory by canceling out pairs of distinct elements.',
    realWorldExample: 'A debate arena where two opposing voters cancel each other out and leave the room; the candidate supported by a strict majority will always be the last person standing.',
    stepByStepLogic: [
      '1. Initialize candidate = None and count = 0.',
      '2. For each element x: if count == 0, set candidate = x and count = 1.',
      '3. Else if x == candidate, increment count.',
      '4. Else, decrement count.',
      '5. Optional: verify candidate frequency exceeds n // 2.'
    ],
    pythonCode: `# Boyer-Moore Majority Vote
def majority_element(arr):
    candidate = None
    count = 0
    for x in arr:
        if count == 0:
            candidate = x
            count = 1
        elif x == candidate:
            count += 1
        else:
            count -= 1
    return candidate

votes = [2, 2, 1, 1, 1, 2, 2]
print("Majority Element:", majority_element(votes))
`
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window Algorithm',
    category: 'Array, Two-Pointer, and Sliding Window Algorithms',
    complexity: { time: 'O(N)', space: 'O(K) or O(1)' },
    explanation: 'Maintains a contiguous window over a sequence, adding newly encountered elements at the right end and removing expired elements at the left end to avoid redundant subproblem calculations.',
    realWorldExample: 'Looking through a moving train window at a rolling landscape of 3 consecutive telegraph poles at any given instant.',
    stepByStepLogic: [
      '1. Compute the state (e.g. sum or frequency map) of the first window of size k.',
      '2. Slide the window one element to the right at each iteration.',
      '3. Subtract the element leaving the left edge and add the new element entering the right edge.',
      '4. Update the answer with the new window state.',
      '5. Continue until the right boundary hits the end of the array.'
    ],
    pythonCode: `# Sliding Window: Maximum sum of k consecutive elements
def max_sum_subarray(arr, k):
    n = len(arr)
    if n < k:
        return None
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(k, n):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum

nums = [2, 1, 5, 1, 3, 2]
print("Max sum of window size 3:", max_sum_subarray(nums, 3))
`
  },
  {
    id: 'two-pointer',
    name: 'Two-Pointer Algorithm',
    category: 'Array, Two-Pointer, and Sliding Window Algorithms',
    complexity: { time: 'O(N)', space: 'O(1)' },
    explanation: 'Uses two pointers that traverse a data structure from opposing directions or varying speeds to search pairs or partition data efficiently.',
    realWorldExample: 'Two friends starting at opposite ends of a street and walking toward each other until they meet at their favorite café.',
    stepByStepLogic: [
      '1. Sort the array (if not already sorted).',
      '2. Initialize left = 0 and right = len(arr) - 1.',
      '3. Calculate the sum of arr[left] + arr[right].',
      '4. If the sum equals the target, return the pair indices.',
      '5. If the sum is less than target, increment left.',
      '6. If the sum is greater than target, decrement right.'
    ],
    pythonCode: `# Two-Pointer: Two Sum in a sorted array
def two_sum_sorted(arr, target):
    left = 0
    right = len(arr) - 1
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return (left, right)
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return None

sorted_nums = [1, 2, 4, 7, 11, 15]
print("Indices summing to 15:", two_sum_sorted(sorted_nums, 15))
`
  },
  {
    id: 'prefix-sum',
    name: 'Prefix Sum Algorithm',
    category: 'Array, Two-Pointer, and Sliding Window Algorithms',
    complexity: { time: 'O(1) query / O(N) prep', space: 'O(N)' },
    explanation: 'Precomputes cumulative running sums of an array into an auxiliary prefix array to answer any range sum query [L, R] in O(1) time as prefix[R + 1] - prefix[L].',
    realWorldExample: 'Tracking cumulative odometer readings in a vehicle at each mile marker to compute distance traveled between any two markers by simple subtraction.',
    stepByStepLogic: [
      '1. Allocate prefix array of size n + 1 initialized with 0.',
      '2. For i from 0 to n - 1: prefix[i + 1] = prefix[i] + arr[i].',
      '3. For any query range [L, R], return prefix[R + 1] - prefix[L].'
    ],
    pythonCode: `# Prefix Sum Array
class PrefixSum:
    def __init__(self, arr):
        self.prefix = [0] * (len(arr) + 1)
        for i in range(len(arr)):
            self.prefix[i + 1] = self.prefix[i] + arr[i]

    def query(self, left, right):
        return self.prefix[right + 1] - self.prefix[left]

ps = PrefixSum([3, 1, 4, 1, 5, 9, 2])
print("Sum from index 2 to 5:", ps.query(2, 5))
`
  },
  {
    id: 'difference-array',
    name: 'Difference Array Algorithm',
    category: 'Array, Two-Pointer, and Sliding Window Algorithms',
    complexity: { time: 'O(1) range update / O(N) rebuild', space: 'O(N)' },
    explanation: 'Enables constant-time O(1) range addition updates by marking diff[L] += val and diff[R + 1] -= val, followed by a prefix sum pass to reconstruct the final array.',
    realWorldExample: 'Logging changes to a bank account balance ledger where you note when recurring deposits start and stop, then computing the final balance at year-end.',
    stepByStepLogic: [
      '1. Initialize a difference array D where D[0] = arr[0] and D[i] = arr[i] - arr[i - 1].',
      '2. For each range update [L, R, val]: set D[L] += val, and if R + 1 < n: D[R + 1] -= val.',
      '3. Rebuild original values by taking the running prefix sum of D.'
    ],
    pythonCode: `# Difference Array for O(1) Range Updates
def apply_range_updates(n, updates):
    diff = [0] * (n + 1)
    for l, r, val in updates:
        diff[l] += val
        diff[r + 1] -= val
    res = [0] * n
    res[0] = diff[0]
    for i in range(1, n):
        res[i] = res[i - 1] + diff[i]
    return res

ops = [(1, 3, 5), (2, 4, 10), (0, 2, -2)]
print("Array after updates:", apply_range_updates(5, ops))
`
  },
  {
    id: 'mos-algorithm',
    name: 'Mo’s Algorithm',
    category: 'Array, Two-Pointer, and Sliding Window Algorithms',
    complexity: { time: 'O((N + Q) √N)', space: 'O(Q)' },
    explanation: 'An offline query algorithm that reorders range queries by block index (L // √N) and right boundary to minimize total pointer movement when expanding and shrinking the query window.',
    realWorldExample: 'A courier grouping delivery stops by neighborhood blocks and sweeping through addresses efficiently rather than zigzagging across the entire city for each package.',
    stepByStepLogic: [
      '1. Divide array into blocks of size B = int(sqrt(n)).',
      '2. Sort queries primarily by (query.L // B) and secondarily by query.R.',
      '3. Maintain current window [curL, curR] and add/remove elements as pointers move.',
      '4. Store answers in original query order.'
    ],
    pythonCode: `# Mo's Algorithm
import math

def mos_algorithm(arr, queries):
    n = len(arr)
    block_size = max(1, int(math.isqrt(n)))
    sorted_queries = sorted(enumerate(queries), key=lambda q: (q[1][0] // block_size, q[1][1]))
    answers = [0] * len(queries)
    cur_l = 0
    cur_r = -1
    cur_sum = 0

    for orig_idx, (l, r) in sorted_queries:
        while cur_l > l:
            cur_l -= 1
            cur_sum += arr[cur_l]
        while cur_r < r:
            cur_r += 1
            cur_sum += arr[cur_r]
        while cur_l < l:
            cur_sum -= arr[cur_l]
            cur_l += 1
        while cur_r > r:
            cur_sum -= arr[cur_r]
            cur_r -= 1
        answers[orig_idx] = cur_sum

    return answers

data = [1, 3, 5, 2, 7, 6, 3, 1]
q = [(0, 3), (2, 6), (1, 4)]
print("Query results:", mos_algorithm(data, q))
`
  },
  {
    id: 'k-way-merge',
    name: 'K-Way Merge Algorithm',
    category: 'Array, Two-Pointer, and Sliding Window Algorithms',
    complexity: { time: 'O(N log K)', space: 'O(K)' },
    explanation: 'Merges K sorted lists into one sorted list using a min-heap to repeatedly pick the smallest current element across all list heads.',
    realWorldExample: 'Merging K airport check-in queues into a single security screening checkpoint by always calling forward whichever passenger is at the front of any line with the lowest ticket number.',
    stepByStepLogic: [
      '1. Insert the first element of each of the K lists into a min-heap along with its list and element index.',
      '2. Extract the minimum element from the heap and append it to output.',
      '3. If the extracted element has a successor in its originating list, insert the successor into the heap.',
      '4. Repeat until the heap is empty.'
    ],
    pythonCode: `# K-Way Merge using Min-Heap
import heapq

def merge_k_sorted(lists):
    heap = []
    for list_idx, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst[0], list_idx, 0))
    result = []
    while heap:
        val, list_idx, elem_idx = heapq.heappop(heap)
        result.append(val)
        if elem_idx + 1 < len(lists[list_idx]):
            next_val = lists[list_idx][elem_idx + 1]
            heapq.heappush(heap, (next_val, list_idx, elem_idx + 1))
    return result

sorted_lists = [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
print("Merged:", merge_k_sorted(sorted_lists))
`
  },
  {
    id: 'floyds-cycle-detection',
    name: 'Floyd’s Cycle Detection Algorithm (Tortoise and Hare)',
    category: 'Array, Two-Pointer, and Sliding Window Algorithms',
    complexity: { time: 'O(N)', space: 'O(1)' },
    explanation: 'Uses two pointers moving at different speeds (slow by 1 step, fast by 2 steps) to detect if a cycle exists in a sequence or linked list.',
    realWorldExample: 'Two runners on a circular track where the faster runner eventually laps and collides with the slower runner.',
    stepByStepLogic: [
      '1. Initialize slow = head and fast = head.',
      '2. Advance slow by 1 node and fast by 2 nodes in each step.',
      '3. If fast reaches end or null, no cycle exists.',
      '4. If slow == fast, a cycle is detected.',
      '5. To find cycle entrance: reset slow to head and advance both by 1 step until they meet.'
    ],
    pythonCode: `# Floyd's Cycle Detection
class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def has_cycle(head):
    slow = head
    fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False

# Build linked list with cycle: 1 -> 2 -> 3 -> 4 -> 2...
a, b, c, d = Node(1), Node(2), Node(3), Node(4)
a.next, b.next, c.next, d.next = b, c, d, b
print("Has cycle:", has_cycle(a))
`
  },
  {
    id: 'brents-cycle-detection',
    name: 'Brent’s Cycle Detection Algorithm',
    category: 'Array, Two-Pointer, and Sliding Window Algorithms',
    complexity: { time: 'O(N)', space: 'O(1)' },
    explanation: 'An alternative cycle finding algorithm that moves the fast pointer in powers of two steps while keeping the slow pointer stationary, finding cycles with 24-36% fewer steps than Floyd’s algorithm.',
    realWorldExample: 'Searching for a loop on a walking path by standing at a basecamp and sending a scout forward in expanding powers-of-two strides (1, 2, 4, 8) to see if they circle back.',
    stepByStepLogic: [
      '1. Initialize power = 1, length = 1, slow = head, fast = head.next.',
      '2. While fast is not null and slow != fast:',
      '3. If length == power: slow moves to fast, power *= 2, length = 0.',
      '4. Advance fast = fast.next and length += 1.',
      '5. If fast is null, return False. If slow == fast, return True.'
    ],
    pythonCode: `# Brent's Cycle Detection Algorithm
class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def brents_cycle(head):
    if not head:
        return False
    power = 1
    length = 1
    slow = head
    fast = head.next
    while fast and slow != fast:
        if length == power:
            slow = fast
            power *= 2
            length = 0
        fast = fast.next
        length += 1
    return fast is not None

a, b, c, d = Node(1), Node(2), Node(3), Node(4)
a.next, b.next, c.next, d.next = b, c, d, b
print("Has cycle (Brent):", brents_cycle(a))
`
  }
];
