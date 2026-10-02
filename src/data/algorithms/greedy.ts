import type { AlgorithmData } from './types';

export const greedyAlgorithms: AlgorithmData[] = [
  {
    id: 'huffman-coding',
    name: 'Huffman Coding',
    category: 'Greedy Algorithms',
    complexity: { time: 'O(N log N)', space: 'O(N)' },
    explanation: 'A lossless data compression algorithm that assigns variable-length prefix binary codes to characters based on their frequency of occurrence.',
    realWorldExample: 'Morse code assigning short single-dot dits to frequent letters like "E" and longer multi-dash signals to rare letters like "Q".',
    stepByStepLogic: [
      '1. Calculate character frequencies and push leaf nodes into a min-heap.',
      '2. While heap size > 1: pop the two nodes with the lowest frequencies.',
      '3. Create a new internal node with frequency equal to the sum of their frequencies.',
      '4. Assign the two popped nodes as left and right children and re-insert into the heap.',
      '5. Traverse the resulting tree to generate variable-length binary prefix codes.'
    ],
    pythonCode: `# Huffman Coding
import heapq

class HuffmanNode:
    def __init__(self, char, freq):
        self.char = char
        self.freq = freq
        self.left = None
        self.right = None
    def __lt__(self, other):
        return self.freq < other.freq

def build_huffman_tree(text):
    freq = {}
    for ch in text: freq[ch] = freq.get(ch, 0) + 1
    heap = [HuffmanNode(ch, count) for ch, count in freq.items()]
    heapq.heapify(heap)
    while len(heap) > 1:
        n1 = heapq.heappop(heap)
        n2 = heapq.heappop(heap)
        merged = HuffmanNode(None, n1.freq + n2.freq)
        merged.left, merged.right = n1, n2
        heapq.heappush(heap, merged)
    return heap[0]

root = build_huffman_tree("BEEP BOOP BEER")
print("Huffman Root Frequency:", root.freq)
`
  },
  {
    id: 'activity-selection',
    name: 'Activity Selection Algorithm',
    category: 'Greedy Algorithms',
    complexity: { time: 'O(N log N)', space: 'O(1)' },
    explanation: 'Selects the maximum number of mutually compatible activities to be performed by a single resource by greedily picking the activity that finishes earliest.',
    realWorldExample: 'Booking meeting rooms for the day by always approving whichever proposed presentation finishes earliest to leave room for subsequent meetings.',
    stepByStepLogic: [
      '1. Sort all activities by their finish times in non-decreasing order.',
      '2. Select the first activity and record its finish time.',
      '3. For each subsequent activity: if start time >= last selected activity\'s finish time, select it and update finish time.',
      '4. Return the list of selected activities.'
    ],
    pythonCode: `# Activity Selection
def select_activities(activities):
    activities.sort(key=lambda x: x[1]) # Sort by finish time
    selected = [activities[0]]
    last_finish = activities[0][1]
    for start, finish in activities[1:]:
        if start >= last_finish:
            selected.append((start, finish))
            last_finish = finish
    return selected

schedule = [(1, 4), (3, 5), (0, 6), (5, 7), (3, 9), (5, 9), (6, 10), (8, 11)]
print("Selected activities:", select_activities(schedule))
`
  },
  {
    id: 'job-sequencing',
    name: 'Job Sequencing with Deadlines',
    category: 'Greedy Algorithms',
    complexity: { time: 'O(N²)', space: 'O(MaxDeadline)' },
    explanation: 'Schedules jobs with deadlines and profits to maximize total profit, where each job takes 1 unit of time and can only be executed before its deadline.',
    realWorldExample: 'A freelance developer choosing which client rush projects to complete before their hard deadlines to maximize total billing.',
    stepByStepLogic: [
      '1. Sort all jobs in descending order of profit.',
      '2. Initialize a schedule array of slots up to the maximum deadline, initialized as empty.',
      '3. For each job: search backwards from its deadline to find the latest available empty slot.',
      '4. If an empty slot is found, assign the job to that slot and add its profit.',
      '5. Continue until all jobs are processed.'
    ],
    pythonCode: `# Job Sequencing with Deadlines
def job_sequencing(jobs, max_deadline):
    jobs.sort(key=lambda x: x[2], reverse=True) # Sort by profit
    slots = [-1] * max_deadline
    total_profit = 0
    for job_id, deadline, profit in jobs:
        for t in range(min(max_deadline, deadline) - 1, -1, -1):
            if slots[t] == -1:
                slots[t] = job_id
                total_profit += profit
                break
    return slots, total_profit

job_list = [('J1', 2, 100), ('J2', 1, 19), ('J3', 2, 27), ('J4', 1, 25), ('J5', 3, 15)]
print("Schedule & Profit:", job_sequencing(job_list, 3))
`
  },
  {
    id: 'fractional-knapsack',
    name: 'Fractional Knapsack',
    category: 'Greedy Algorithms',
    complexity: { time: 'O(N log N)', space: 'O(1)' },
    explanation: 'Finds the maximum total value possible in a knapsack by sorting items by their value-to-weight ratio (profit density) and greedily taking fractions of items.',
    realWorldExample: 'Scooping bulk spices into a travel pouch: you scoop the most expensive spice per gram first, filling any leftover pouch space with a partial scoop of the next.',
    stepByStepLogic: [
      '1. Calculate ratio = value / weight for each item.',
      '2. Sort items in descending order of their value-to-weight ratio.',
      '3. For each item: if knapsack can hold full weight, take it completely and reduce capacity.',
      '4. Else take fraction: (remaining_capacity / weight) * value, and terminate.'
    ],
    pythonCode: `# Fractional Knapsack
def fractional_knapsack(items, capacity):
    # items: list of (value, weight)
    items.sort(key=lambda x: x[0] / x[1], reverse=True)
    total_value = 0.0
    for value, weight in items:
        if capacity >= weight:
            capacity -= weight
            total_value += value
        else:
            total_value += value * (capacity / weight)
            break
    return total_value

stock = [(60, 10), (100, 20), (120, 30)]
print("Max Value:", fractional_knapsack(stock, 50))
`
  },
  {
    id: 'egyptian-fraction',
    name: 'Egyptian Fraction Algorithm',
    category: 'Greedy Algorithms',
    complexity: { time: 'O(Numerator)', space: 'O(1)' },
    explanation: 'Represents every positive rational fraction as a sum of distinct unit fractions (1/d) by greedily finding the largest possible unit fraction at each step.',
    realWorldExample: 'Ancient Egyptian scribes dividing 5 loaves of bread fairly among 8 people using only single-portion unit fractions.',
    stepByStepLogic: [
      '1. Given fraction numerator nr and denominator dr.',
      '2. If nr == 0 or dr == 0, return.',
      '3. If dr is divisible by nr, output 1 / (dr // nr) and return.',
      '4. Find smallest unit fraction denominator ceil_val = -(-dr // nr).',
      '5. Append 1 / ceil_val, update nr = nr * ceil_val - dr, dr = dr * ceil_val, and recurse.'
    ],
    pythonCode: `# Egyptian Fraction (Greedy Approach)
import math

def egyptian_fraction(nr, dr):
    units = []
    while nr != 0:
        x = math.ceil(dr / nr)
        units.append(x)
        nr = nr * x - dr
        dr = dr * x
    return [f"1/{u}" for u in units]

print("Egyptian Fraction for 6/14:", egyptian_fraction(6, 14))
`
  }
];
