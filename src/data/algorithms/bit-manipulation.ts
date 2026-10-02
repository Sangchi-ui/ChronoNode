import type { AlgorithmData } from './types';

export const bitManipulationAlgorithms: AlgorithmData[] = [
  {
    id: 'brian-kernighans-algorithm',
    name: 'Brian Kernighan’s Algorithm',
    category: 'Bit Manipulation Algorithms',
    complexity: { time: 'O(SetBits)', space: 'O(1)' },
    explanation: 'Counts the number of set bits (1s) in an integer in time proportional only to the number of set bits by repeatedly executing n = n & (n - 1) to clear the lowest set bit.',
    realWorldExample: 'Flipping off lights in a house room by room: instead of inspecting every empty room, you directly visit and switch off only the rooms that have lights on.',
    stepByStepLogic: [
      '1. Initialize count = 0.',
      '2. While n > 0:',
      '3. Perform n = n & (n - 1) which clears the rightmost set bit.',
      '4. Increment count by 1.',
      '5. Return count when n becomes 0.'
    ],
    pythonCode: `# Brian Kernighan's Algorithm
def count_set_bits(n):
    count = 0
    while n:
        n &= (n - 1)
        count += 1
    return count

num = 42 # Binary 101010 (three set bits)
print("Set bits in 42:", count_set_bits(num))
`
  },
  {
    id: 'bit-masking',
    name: 'Bit Masking',
    category: 'Bit Manipulation Algorithms',
    complexity: { time: 'O(1)', space: 'O(1)' },
    explanation: 'Employs binary integers as compact bit sets where the k-th bit indicates presence or absence of an element, using bitwise AND, OR, XOR, and NOT.',
    realWorldExample: 'A permissions control table where a single byte flags user permissions (read=1, write=2, execute=4, delete=8) with simple hardware switches.',
    stepByStepLogic: [
      '1. Check k-th bit: (mask & (1 << k)) != 0.',
      '2. Set k-th bit: mask | (1 << k).',
      '3. Clear k-th bit: mask & ~(1 << k).',
      '4. Toggle k-th bit: mask ^ (1 << k).'
    ],
    pythonCode: `# Bit Masking Operations
def bit_mask_demo():
    mask = 0
    # Set bit 2 and bit 5
    mask |= (1 << 2) | (1 << 5)
    # Check bit 2
    has_bit_2 = bool(mask & (1 << 2))
    # Clear bit 2
    mask &= ~(1 << 2)
    return has_bit_2, bin(mask)

print("Bit masking demo:", bit_mask_demo())
`
  },
  {
    id: 'xor-non-repeating',
    name: 'XOR Non-Repeating Element',
    category: 'Bit Manipulation Algorithms',
    complexity: { time: 'O(N)', space: 'O(1)' },
    explanation: 'Finds the single unique element in an array where every other element appears exactly twice by exploiting XOR identities: x ^ x = 0 and x ^ 0 = x.',
    realWorldExample: 'Matching socks from the laundry: whenever you find a pair, they cancel out into the drawer; the single unpaired sock is left in your hands.',
    stepByStepLogic: [
      '1. Initialize result = 0.',
      '2. For each number x in array: result ^= x.',
      '3. All duplicate pairs cancel to 0.',
      '4. Return result which holds the unique element.'
    ],
    pythonCode: `# XOR Non-Repeating Element
def single_number(nums):
    unique = 0
    for num in nums:
        unique ^= num
    return unique

data = [4, 1, 2, 1, 2]
print("Unique element:", single_number(data))
`
  }
];
