import type { AlgorithmData } from './types';

export const mathNumberTheoryAlgorithms: AlgorithmData[] = [
  {
    id: 'euclidean-algorithm',
    name: 'Euclidean Algorithm',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O(log(min(A, B)))', space: 'O(1)' },
    explanation: 'Computes the Greatest Common Divisor (GCD) of two integers using the property that gcd(a, b) = gcd(b, a % b) until the remainder becomes 0.',
    realWorldExample: 'Tiling a rectangular floor of dimensions 24 × 60 with the largest possible identical square tiles without cutting any tile.',
    stepByStepLogic: [
      '1. While b is not 0:',
      '2. Compute remainder r = a % b.',
      '3. Update a = b and b = r.',
      '4. Return a when b becomes 0.'
    ],
    pythonCode: `# Euclidean Algorithm for GCD
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

print("GCD(48, 18):", gcd(48, 18))
`
  },
  {
    id: 'extended-euclidean',
    name: 'Extended Euclidean Algorithm',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O(log(min(A, B)))', space: 'O(1)' },
    explanation: 'Finds integers x and y satisfying Bézout\'s identity a*x + b*y = gcd(a, b), which is essential for computing modular multiplicative inverses in cryptography.',
    realWorldExample: 'Measuring out an exact liquid volume using two measuring jugs of differing capacities that have no intermediary markings.',
    stepByStepLogic: [
      '1. Base case: if b == 0, return (a, 1, 0).',
      '2. Recursively compute (g, x1, y1) = ext_gcd(b, a % b).',
      '3. Set x = y1 and y = x1 - (a // b) * y1.',
      '4. Return (g, x, y).'
    ],
    pythonCode: `# Extended Euclidean Algorithm
def extended_gcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x1, y1 = extended_gcd(b, a % b)
    x = y1
    y = x1 - (a // b) * y1
    return g, x, y

g, x, y = extended_gcd(30, 20)
print(f"GCD: {g}, Bézout coefficients: x={x}, y={y}")
`
  },
  {
    id: 'sieve-of-eratosthenes',
    name: 'Sieve of Eratosthenes',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O(N log log N)', space: 'O(N)' },
    explanation: 'Finds all prime numbers up to a specified integer N by iteratively marking the multiples of each prime starting from 2 as composite.',
    realWorldExample: 'Sifting through a box of numbered beads with a series of mesh strainers, filtering out all multiples of 2, then multiples of 3, leaving only prime beads.',
    stepByStepLogic: [
      '1. Create a boolean array is_prime of size n + 1 initialized to True (except indices 0 and 1).',
      '2. For p from 2 up to sqrt(n):',
      '3. If is_prime[p] is True, mark all multiples p*p, p*p + p, ... as False.',
      '4. Collect all indices that remain True.'
    ],
    pythonCode: `# Sieve of Eratosthenes
def sieve(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    p = 2
    while p * p <= n:
        if is_prime[p]:
            for i in range(p * p, n + 1, p):
                is_prime[i] = False
        p += 1
    return [i for i in range(2, n + 1) if is_prime[i]]

print("Primes up to 30:", sieve(30))
`
  },
  {
    id: 'segmented-sieve',
    name: 'Segmented Sieve',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O((R - L + 1) log log R + √R log log √R)', space: 'O(√R + (R - L + 1))' },
    explanation: 'Finds primes in a range [L, R] without allocating an array of size R, by finding base primes up to √R and using them to sieve blocks in chunks.',
    realWorldExample: 'Auditing a large range of account numbers (e.g. 1,000,000 to 1,010,000) using a small pocket reference list of basic prime factors.',
    stepByStepLogic: [
      '1. Use simple sieve to find all primes up to sqrt(R).',
      '2. Create boolean array dummy of size (R - L + 1) initialized to True.',
      '3. For each base prime p: find lowest multiple of p >= L and mark all multiples in range.',
      '4. Collect numbers corresponding to True flags.'
    ],
    pythonCode: `# Segmented Sieve
import math

def segmented_sieve(l, r):
    limit = int(math.isqrt(r)) + 1
    base_primes = []
    is_p = [True] * limit
    for p in range(2, limit):
        if is_p[p]:
            base_primes.append(p)
            for i in range(p * p, limit, p): is_p[i] = False
    sieve_arr = [True] * (r - l + 1)
    for p in base_primes:
        start = max(p * p, ((l + p - 1) // p) * p)
        for j in range(start, r + 1, p):
            sieve_arr[j - l] = False
    if l == 1: sieve_arr[0] = False
    return [l + i for i, p in enumerate(sieve_arr) if p]

print("Primes in [10, 30]:", segmented_sieve(10, 30))
`
  },
  {
    id: 'modular-exponentiation',
    name: 'Modular Exponentiation',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O(log B)', space: 'O(1)' },
    explanation: 'Computes (A^B) % C in logarithmic time using repeated squaring and modular arithmetic reduction at each multiplication.',
    realWorldExample: 'Calculating compound interest growth factors in cryptographic algorithms without numbers exploding past computer memory registers.',
    stepByStepLogic: [
      '1. Initialize result = 1 and base = a % c.',
      '2. While exponent b > 0:',
      '3. If b is odd: result = (result * base) % c.',
      '4. base = (base * base) % c.',
      '5. b //= 2.',
      '6. Return result.'
    ],
    pythonCode: `# Modular Exponentiation (Repeated Squaring)
def power_mod(a, b, c):
    res = 1
    a = a % c
    while b > 0:
        if b & 1:
            res = (res * a) % c
        a = (a * a) % c
        b >>= 1
    return res

print("(2^10) % 1000:", power_mod(2, 10, 1000))
`
  },
  {
    id: 'matrix-exponentiation',
    name: 'Matrix Exponentiation',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O(K³ log N)', space: 'O(K²)' },
    explanation: 'Solves linear recurrence relations (such as the N-th Fibonacci number) in O(log N) time by repeatedly squaring a transition matrix.',
    realWorldExample: 'Simulating long-term population migration dynamics across cities over 100 years in a few matrix multiplication steps.',
    stepByStepLogic: [
      '1. Set up state vector and K x K transition matrix.',
      '2. Implement 2D matrix multiplication with modular arithmetic.',
      '3. Raise transition matrix to power N - 1 using binary exponentiation.',
      '4. Multiply powered matrix with base state vector to extract result.'
    ],
    pythonCode: `# Matrix Exponentiation for N-th Fibonacci
def mat_mul(a, b):
    return [
        [a[0][0]*b[0][0] + a[0][1]*b[1][0], a[0][0]*b[0][1] + a[0][1]*b[1][1]],
        [a[1][0]*b[0][0] + a[1][1]*b[1][0], a[1][0]*b[0][1] + a[1][1]*b[1][1]]
    ]

def mat_pow(mat, p):
    res = [[1, 0], [0, 1]]
    base = mat
    while p > 0:
        if p & 1: res = mat_mul(res, base)
        base = mat_mul(base, base)
        p >>= 1
    return res

# Fibonacci transition: [[1, 1], [1, 0]]
t = [[1, 1], [1, 0]]
f_10 = mat_pow(t, 10)
print("Fib(10):", f_10[0][1])
`
  },
  {
    id: 'prime-factorization',
    name: 'Prime Factorization',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O(√N)', space: 'O(log N)' },
    explanation: 'Decomposes an integer into the unique product of its prime factors using trial division up to √N.',
    realWorldExample: 'Breaking down a chemical compound molecule into its constituent fundamental atoms on the periodic table.',
    stepByStepLogic: [
      '1. Divide out all factors of 2 from n, appending 2 to factors list.',
      '2. Loop odd integers d from 3 up to sqrt(n).',
      '3. While n % d == 0: append d and n //= d.',
      '4. If remaining n > 2, append remaining prime n.'
    ],
    pythonCode: `# Prime Factorization (Trial Division)
def prime_factors(n):
    factors = []
    while n % 2 == 0:
        factors.append(2)
        n //= 2
    d = 3
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 2
    if n > 1:
        factors.append(n)
    return factors

print("Factors of 84:", prime_factors(84))
`
  },
  {
    id: 'pollards-rho',
    name: 'Pollard’s rho Algorithm',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O(N^(1/4))', space: 'O(1)' },
    explanation: 'A randomized integer factorization algorithm based on the Birthday Paradox and Floyd\'s cycle detection using polynomial pseudorandom sequence f(x) = (x² + c) % n.',
    realWorldExample: 'Finding a shared birthday in a room full of people: you need far fewer people than 365 to find two people who share a birthday.',
    stepByStepLogic: [
      '1. Initialize x = 2, y = 2, d = 1, and function f(x) = (x*x + 1) % n.',
      '2. Advance x = f(x) and y = f(f(y)).',
      '3. Calculate d = gcd(|x - y|, n).',
      '4. If 1 < d < n, return d as a non-trivial factor.',
      '5. If d == n, pick a new random starting seed and repeat.'
    ],
    pythonCode: `# Pollard's rho Algorithm
import math

def pollards_rho(n):
    if n % 2 == 0: return 2
    x = 2; y = 2; d = 1; c = 1
    f = lambda val: (val * val + c) % n
    while d == 1:
        x = f(x)
        y = f(f(y))
        d = math.gcd(abs(x - y), n)
        if d == n:
            return pollards_rho(n)
    return d

print("Non-trivial factor of 8051:", pollards_rho(8051))
`
  },
  {
    id: 'fermats-little-theorem',
    name: 'Fermat’s Little Theorem',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O(log P)', space: 'O(1)' },
    explanation: 'States that if p is prime and gcd(a, p) = 1, then a^(p - 1) ≡ 1 (mod p), implying modular inverse a^(p - 2) ≡ a^(-1) (mod p).',
    realWorldExample: 'A clock face of prime circumference where skipping by a fixed stride p - 1 times always lands you exactly back on your starting tick.',
    stepByStepLogic: [
      '1. Verify p is prime and a is not divisible by p.',
      '2. Compute modular inverse of a mod p as a^(p - 2) % p using modular exponentiation.',
      '3. Verify (a * inv) % p == 1.'
    ],
    pythonCode: `# Fermat's Little Theorem: Modular Inverse
def mod_inverse(a, p):
    return pow(a, p - 2, p)

p = 1000000007 # Large prime
inv = mod_inverse(3, p)
print("Modular inverse of 3 mod 10^9+7:", inv)
print("Verification (3 * inv) % p:", (3 * inv) % p)
`
  },
  {
    id: 'miller-rabin',
    name: 'Miller-Rabin Primality Test',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O(K log³ N)', space: 'O(1)' },
    explanation: 'A probabilistic primality test that decomposes n - 1 = 2^s · d and checks whether random bases a are Miller-Rabin witnesses to composite status.',
    realWorldExample: 'A counterfeit bill detector that tests paper fibers under K different ultraviolet light frequencies; passing all tests guarantees authenticity.',
    stepByStepLogic: [
      '1. Factor out powers of 2 from n - 1: write n - 1 = d * 2^s where d is odd.',
      '2. Pick random base a in [2, n - 2]. Compute x = pow(a, d, n).',
      '3. If x == 1 or x == n - 1, continue to next witness.',
      '4. Repeat squaring x = (x * x) % n up to s - 1 times. If x == n - 1, witness passed.',
      '5. If it never reaches n - 1, n is definitely composite.'
    ],
    pythonCode: `# Miller-Rabin Primality Test
import random

def is_prime_miller_rabin(n, k=5):
    if n <= 1: return False
    if n <= 3: return True
    if n % 2 == 0: return False
    d = n - 1
    s = 0
    while d % 2 == 0:
        d //= 2; s += 1
    for _ in range(k):
        a = random.randint(2, n - 2)
        x = pow(a, d, n)
        if x == 1 or x == n - 1: continue
        for _ in range(s - 1):
            x = pow(x, 2, n)
            if x == n - 1: break
        else: return False
    return True

print("Is 1000000007 prime?", is_prime_miller_rabin(1000000007))
`
  },
  {
    id: 'chinese-remainder-theorem',
    name: 'Chinese Remainder Theorem',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O(K log(Product M))', space: 'O(K)' },
    explanation: 'Finds a unique integer x modulo the product of pairwise coprime moduli M satisfying a system of simultaneous linear congruences: x ≡ a_i (mod m_i).',
    realWorldExample: 'An ancient general counting his soldiers by having them line up in rows of 3, rows of 5, and rows of 7, deducing the exact army size from remainders.',
    stepByStepLogic: [
      '1. Compute total product M = m1 * m2 * ... * mk.',
      '2. For each congruence: compute M_i = M // m_i.',
      '3. Find modular inverse y_i of M_i modulo m_i.',
      '4. Sum terms: x = sum(a_i * M_i * y_i) % M.'
    ],
    pythonCode: `# Chinese Remainder Theorem
def crt(remainders, moduli):
    prod = 1
    for m in moduli: prod *= m
    res = 0
    for rem, m in zip(remainders, moduli):
        m_i = prod // m
        inv = pow(m_i, -1, m)
        res = (res + rem * m_i * inv) % prod
    return res

# x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)
print("CRT Solution:", crt([2, 3, 2], [3, 5, 7]))
`
  },
  {
    id: 'eulers-totient',
    name: 'Euler’s Totient Function',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O(√N)', space: 'O(1)' },
    explanation: 'Counts positive integers up to n that are coprime to n, calculated with Euler\'s product formula: φ(n) = n · ∏(1 - 1/p) for each distinct prime factor p.',
    realWorldExample: 'Calculating how many radio broadcast frequencies below frequency N will not create harmonic interference with a master broadcast frequency.',
    stepByStepLogic: [
      '1. Initialize result = n.',
      '2. For each prime factor p dividing n: result = result * (1 - 1/p).',
      '3. Divide out all occurrences of p from n.',
      '4. If remaining n > 1, multiply by (1 - 1/n).'
    ],
    pythonCode: `# Euler's Totient Function φ(N)
def phi(n):
    result = n
    p = 2
    while p * p <= n:
        if n % p == 0:
            while n % p == 0:
                n //= p
            result -= result // p
        p += 1
    if n > 1:
        result -= result // n
    return result

print("φ(36):", phi(36)) # Numbers coprime to 36
`
  },
  {
    id: 'lucas-theorem',
    name: 'Lucas Theorem',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O(P² log_p N)', space: 'O(P)' },
    explanation: 'Computes binomial coefficients (N choose K) modulo a small prime P by expressing N and K in base P and multiplying (n_i choose k_i) mod P.',
    realWorldExample: 'Breaking down a huge lottery combination calculation into small manageable base-10 digit lottery calculations.',
    stepByStepLogic: [
      '1. Express n and k in base p notation (n_k ... n_0 and k_k ... k_0).',
      '2. Compute C(n_i, k_i) mod p for each digit place.',
      '3. Multiply all digit binomial coefficients modulo p.',
      '4. If any digit has k_i > n_i, result is 0.'
    ],
    pythonCode: `# Lucas Theorem for (N choose K) % P
import math

def nCr_mod_p(n, r, p):
    if r > n: return 0
    return (math.comb(n, r)) % p

def lucas(n, r, p):
    if r == 0: return 1
    ni = n % p
    ri = r % p
    return (lucas(n // p, r // p, p) * nCr_mod_p(ni, ri, p)) % p

print("Comb(10, 2) % 13:", lucas(10, 2, 13))
`
  },
  {
    id: 'fast-fourier-transform',
    name: 'Fast Fourier Transform (FFT)',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O(N log N)', space: 'O(N)' },
    explanation: 'Converts a polynomial or signal between coefficient representation and point-value representation in O(N log N) using complex roots of unity, enabling fast polynomial multiplication.',
    realWorldExample: 'An audio equalizer breaking down a mixed sound recording into its individual bass, mid, and treble frequency components.',
    stepByStepLogic: [
      '1. Split polynomial into even and odd index coefficient polynomials.',
      '2. Recursively compute FFT of even and odd parts.',
      '3. Combine sub-results using principal N-th roots of unity (twiddle factors): e^(-2πi · k / N).',
      '4. Inverse FFT transforms point-values back into polynomial coefficients.'
    ],
    pythonCode: `# Fast Fourier Transform (Cooley-Tukey)
import cmath

def fft(a):
    n = len(a)
    if n <= 1: return a
    even = fft(a[0::2])
    odd = fft(a[1::2])
    t = [cmath.exp(-2j * cmath.pi * k / n) * odd[k] for k in range(n // 2)]
    return [even[k] + t[k] for k in range(n // 2)] + [even[k] - t[k] for k in range(n // 2)]

signal = [1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0]
print("FFT length:", len(fft(signal)))
`
  },
  {
    id: 'karatsuba-algorithm',
    name: 'Karatsuba Algorithm',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O(N^1.585)', space: 'O(N)' },
    explanation: 'A fast divide-and-conquer multiplication algorithm that multiplies two n-digit numbers using only 3 recursive multiplications instead of the classical 4.',
    realWorldExample: 'A mental math shortcut that multiplies double-digit numbers by computing cross-terms with a single combined multiplication.',
    stepByStepLogic: [
      '1. Split numbers into halves: x = x1*B + x0 and y = y1*B + y0.',
      '2. Compute z0 = x0 * y0 and z2 = x1 * y1.',
      '3. Compute z1 = (x1 + x0) * (y1 + y0) - z2 - z0.',
      '4. Return z2 * B^2 + z1 * B + z0.'
    ],
    pythonCode: `# Karatsuba Fast Multiplication
def karatsuba(x, y):
    if x < 10 or y < 10:
        return x * y
    m = max(len(str(x)), len(str(y)))
    m2 = m // 2
    high1, low1 = divmod(x, 10**m2)
    high2, low2 = divmod(y, 10**m2)
    z0 = karatsuba(low1, low2)
    z1 = karatsuba((low1 + high1), (low2 + high2))
    z2 = karatsuba(high1, high2)
    return (z2 * 10**(2 * m2)) + ((z1 - z2 - z0) * 10**m2) + z0

print("Karatsuba 1234 * 5678:", karatsuba(1234, 5678))
`
  },
  {
    id: 'strassen-multiplication',
    name: 'Strassen’s Matrix Multiplication',
    category: 'Mathematical & Number Theory Algorithms',
    complexity: { time: 'O(N^2.807)', space: 'O(N²)' },
    explanation: 'A sub-cubic divide-and-conquer matrix multiplication algorithm that computes the product of two 2x2 block matrices using 7 multiplications instead of standard 8.',
    realWorldExample: 'Combining factory assembly operations so that 7 specialized robotic welding passes achieve what usually takes 8 separate stations.',
    stepByStepLogic: [
      '1. Partition input matrices A and B into four n/2 x n/2 sub-matrices.',
      '2. Compute 10 auxiliary addition/subtraction matrices.',
      '3. Recursively calculate the 7 Strassen products M1 through M7.',
      '4. Combine M1..M7 to form the four quadrants of the output matrix C.'
    ],
    pythonCode: `# Strassen's 2x2 Matrix Multiplication
def strassen_2x2(a, b):
    m1 = (a[0][0] + a[1][1]) * (b[0][0] + b[1][1])
    m2 = (a[1][0] + a[1][1]) * b[0][0]
    m3 = a[0][0] * (b[0][1] - b[1][1])
    m4 = a[1][1] * (b[1][0] - b[0][0])
    m5 = (a[0][0] + a[0][1]) * b[1][1]
    m6 = (a[1][0] - a[0][0]) * (b[0][0] + b[0][1])
    m7 = (a[0][1] - a[1][1]) * (b[1][0] + b[1][1])
    c00 = m1 + m4 - m5 + m7
    c01 = m3 + m5
    c10 = m2 + m4
    c11 = m1 - m2 + m3 + m6
    return [[c00, c01], [c10, c11]]

A = [[1, 2], [3, 4]]
B = [[5, 6], [7, 8]]
print("Strassen Product:", strassen_2x2(A, B))
`
  }
];
