import type { AlgorithmData } from './types';

export const randomizedHeuristicAlgorithms: AlgorithmData[] = [
  {
    id: 'reservoir-sampling',
    name: 'Reservoir Sampling',
    category: 'Randomized & Heuristic Algorithms',
    complexity: { time: 'O(N)', space: 'O(K)' },
    explanation: 'Randomly samples K items uniformly from a stream of unknown or infinite length in a single pass, ensuring every element has equal k / N probability of selection.',
    realWorldExample: 'Drawing a fair sample of lottery tickets from a continuous conveyor belt without knowing beforehand how many tickets will pass on the belt.',
    stepByStepLogic: [
      '1. Fill the reservoir array with the first k items from the stream.',
      '2. For each subsequent i-th item (i from k to n - 1):',
      '3. Pick a random integer j between 0 and i inclusive.',
      '4. If j < k, replace reservoir[j] with the new item.',
      '5. Return reservoir.'
    ],
    pythonCode: `# Reservoir Sampling (Sampling k items from stream)
import random

def reservoir_sample(stream, k):
    reservoir = []
    for i, item in enumerate(stream):
        if i < k:
            reservoir.append(item)
        else:
            j = random.randint(0, i)
            if j < k:
                reservoir[j] = item
    return reservoir

data_stream = list(range(100))
print("Sample of 5:", reservoir_sample(data_stream, 5))
`
  },
  {
    id: 'fisher-yates-shuffle',
    name: 'Fisher-Yates Shuffle',
    category: 'Randomized & Heuristic Algorithms',
    complexity: { time: 'O(N)', space: 'O(1)' },
    explanation: 'Generates an unbiased, uniformly random permutation of an array in linear time by iterating backwards and swapping each element with a randomly chosen predecessor.',
    realWorldExample: 'A casino card shuffler dealing cards from an ordered deck into a fresh random shoe where every card ordering is mathematically equally likely.',
    stepByStepLogic: [
      '1. Loop index i from n - 1 down to 1.',
      '2. Pick a random index j uniformly between 0 and i inclusive.',
      '3. Swap arr[i] with arr[j].',
      '4. The subarray from i to n - 1 is now permanently shuffled.'
    ],
    pythonCode: `# Fisher-Yates Shuffle (Knuth Shuffle)
import random

def fisher_yates(arr):
    for i in range(len(arr) - 1, 0, -1):
        j = random.randint(0, i)
        arr[i], arr[j] = arr[j], arr[i]
    return arr

deck = [1, 2, 3, 4, 5, 6, 7, 8]
print("Shuffled Deck:", fisher_yates(deck))
`
  },
  {
    id: 'monte-carlo-algorithms',
    name: 'Monte Carlo Algorithms',
    category: 'Randomized & Heuristic Algorithms',
    complexity: { time: 'O(Samples)', space: 'O(1)' },
    explanation: 'A class of randomized algorithms whose execution time is deterministic, but whose output has a small probability of error that can be reduced with repeated trials (e.g. estimating π).',
    realWorldExample: 'Throwing 10,000 darts randomly at a circular dartboard inscribed in a square to estimate the mathematical constant π by counting landed hits.',
    stepByStepLogic: [
      '1. Generate N random points (x, y) uniformly inside a 1x1 square.',
      '2. Test if point lies inside the unit circle quadrant (x² + y² <= 1).',
      '3. Count successful points inside the circle.',
      '4. Approximate π as 4 * (inside_count / N).'
    ],
    pythonCode: `# Monte Carlo Estimation of Pi
import random

def estimate_pi(num_samples=10000):
    inside = 0
    for _ in range(num_samples):
        x, y = random.random(), random.random()
        if x * x + y * y <= 1.0:
            inside += 1
    return 4 * inside / num_samples

print("Estimated Pi:", estimate_pi(10000))
`
  },
  {
    id: 'las-vegas-algorithms',
    name: 'Las Vegas Algorithms',
    category: 'Randomized & Heuristic Algorithms',
    complexity: { time: 'O(N log N) expected', space: 'O(log N)' },
    explanation: 'A randomized algorithm that always produces the strictly correct answer, but whose runtime is a random variable dependent on internal random choices (e.g. Randomized QuickSort).',
    realWorldExample: 'Searching for your car keys by searching random pockets: you will never pull out the wrong keys, but how long it takes varies with luck.',
    stepByStepLogic: [
      '1. Pick a pivot element uniformly at random from the subarray.',
      '2. Partition the array around the chosen random pivot.',
      '3. Guarantee that the partition result is mathematically correct.',
      '4. Recurse on subproblems.'
    ],
    pythonCode: `# Las Vegas Algorithm: Randomized QuickSort Pivot
import random

def randomized_partition(arr, low, high):
    pivot_idx = random.randint(low, high)
    arr[pivot_idx], arr[high] = arr[high], arr[pivot_idx]
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

items = [5, 2, 9, 1, 7]
print("Randomized Pivot Index:", randomized_partition(items, 0, 4))
`
  },
  {
    id: 'minimax-algorithm',
    name: 'Minimax Algorithm',
    category: 'Randomized & Heuristic Algorithms',
    complexity: { time: 'O(B^D)', space: 'O(D)' },
    explanation: 'A decision rule used in two-player zero-sum games (like Chess or Tic-Tac-Toe) that maximizes the player\'s best payoff while assuming the opponent minimizes it.',
    realWorldExample: 'A chess grandmaster anticipating their opponent\'s best possible counter-moves 5 turns in advance to pick the safest winning line.',
    stepByStepLogic: [
      '1. If current game state is terminal or maximum search depth reached, return static evaluation.',
      '2. If maximizing player\'s turn: iterate all valid moves, recurse, and choose maximum score.',
      '3. If minimizing player\'s turn: iterate all valid moves, recurse, and choose minimum score.',
      '4. Return the optimal move score.'
    ],
    pythonCode: `# Minimax Algorithm (Tic-Tac-Toe concept)
def minimax(depth, is_maximizing):
    # Base terminal condition
    if depth == 0:
        return 0
    if is_maximizing:
        best = -float('inf')
        for child_eval in [3, 5, 2]:
            best = max(best, minimax(depth - 1, False) + child_eval)
        return best
    else:
        best = float('inf')
        for child_eval in [1, 4]:
            best = min(best, minimax(depth - 1, True) + child_eval)
        return best

print("Optimal evaluated move score:", minimax(2, True))
`
  },
  {
    id: 'alpha-beta-pruning',
    name: 'Alpha-Beta Pruning',
    category: 'Randomized & Heuristic Algorithms',
    complexity: { time: 'O(B^(D/2)) optimal', space: 'O(D)' },
    explanation: 'An optimization technique for the minimax algorithm that prunes away search tree branches that cannot possibly influence the final decision, maintaining bounds alpha and beta.',
    realWorldExample: 'A game player dismissing an entire branch of options immediately because the opponent has an obvious move that would ruin that branch completely.',
    stepByStepLogic: [
      '1. Initialize alpha = -infinity (best already explored for maximizer) and beta = +infinity (best for minimizer).',
      '2. While searching child moves, update alpha on maximizing turns and beta on minimizing turns.',
      '3. If beta <= alpha: prune remaining siblings (cutoff) because the opponent would never allow this line to occur.',
      '4. Return evaluated score.'
    ],
    pythonCode: `# Alpha-Beta Pruning
def alpha_beta(depth, alpha, beta, is_max, values, idx=0):
    if depth == 3:
        return values[idx]
    if is_max:
        best = -float('inf')
        for i in range(2):
            val = alpha_beta(depth + 1, alpha, beta, False, values, idx * 2 + i)
            best = max(best, val)
            alpha = max(alpha, best)
            if beta <= alpha:
                break # Prune
        return best
    else:
        best = float('inf')
        for i in range(2):
            val = alpha_beta(depth + 1, alpha, beta, True, values, idx * 2 + i)
            best = min(best, val)
            beta = min(beta, best)
            if beta <= alpha:
                break # Prune
        return best

leaf_values = [3, 5, 6, 9, 1, 2, 0, -1]
print("Optimal score with pruning:", alpha_beta(0, -float('inf'), float('inf'), True, leaf_values))
`
  }
];
