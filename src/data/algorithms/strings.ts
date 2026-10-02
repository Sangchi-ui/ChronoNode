import type { AlgorithmData } from './types';

export const stringAlgorithms: AlgorithmData[] = [
  {
    id: 'naive-string-matching',
    name: 'Naive String Matching',
    category: 'String & Pattern Matching Algorithms',
    complexity: { time: 'O(N · M)', space: 'O(1)' },
    explanation: 'Slides a pattern string over a text character by character and checks for matches at every possible starting index.',
    realWorldExample: 'Holding a stencil over a paragraph of text and sliding it along word by word to see if the window cutout matches your keyword.',
    stepByStepLogic: [
      '1. Loop text index i from 0 to len(text) - len(pattern).',
      '2. In an inner loop, check if text[i + j] == pattern[j] for all j from 0 to len(pattern) - 1.',
      '3. If all characters match, record index i as a match.',
      '4. Continue to find all occurrences.'
    ],
    pythonCode: `# Naive String Matching
def naive_search(pattern, text):
    m = len(pattern)
    n = len(text)
    matches = []
    for i in range(n - m + 1):
        j = 0
        while j < m and text[i + j] == pattern[j]:
            j += 1
        if j == m:
            matches.append(i)
    return matches

txt = "AABAACAADAABAABA"
pat = "AABA"
print("Matches at indices:", naive_search(pat, txt))
`
  },
  {
    id: 'kmp-algorithm',
    name: 'Knuth-Morris-Pratt (KMP) Algorithm',
    category: 'String & Pattern Matching Algorithms',
    complexity: { time: 'O(N + M)', space: 'O(M)' },
    explanation: 'Avoids backtracking in the text string by precomputing a Longest Proper Prefix which is also a Suffix (LPS) table for the pattern.',
    realWorldExample: 'A reader who, upon noticing a spelling mismatch in the middle of a word, skips forward without re-reading letters they already verified.',
    stepByStepLogic: [
      '1. Construct the LPS array where lps[i] stores the length of the longest matching proper prefix-suffix for pattern[0...i].',
      '2. Scan text with pointer i and pattern with pointer j.',
      '3. When characters match, increment both pointers.',
      '4. If a mismatch occurs after j matches, look up lps[j - 1] to avoid rechecking matched prefix.',
      '5. Continue until end of text.'
    ],
    pythonCode: `# KMP Pattern Search
def compute_lps(pattern):
    lps = [0] * len(pattern)
    length = 0
    i = 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        else:
            if length != 0:
                length = lps[length - 1]
            else:
                lps[i] = 0
                i += 1
    return lps

def kmp_search(pattern, text):
    lps = compute_lps(pattern)
    i = j = 0
    matches = []
    while i < len(text):
        if pattern[j] == text[i]:
            i += 1
            j += 1
        if j == len(pattern):
            matches.append(i - j)
            j = lps[j - 1]
        elif i < len(text) and pattern[j] != text[i]:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1
    return matches

print("KMP Matches:", kmp_search("ABABCABAB", "ABABDABACDABABCABAB"))
`
  },
  {
    id: 'rabin-karp',
    name: 'Rabin-Karp Algorithm',
    category: 'String & Pattern Matching Algorithms',
    complexity: { time: 'O(N + M) avg / O(N · M) worst', space: 'O(1)' },
    explanation: 'Uses a rolling hash to compare hash values of the pattern and text substrings, performing character-by-character checks only upon hash collision.',
    realWorldExample: 'Scanning barcodes on packages passing on a conveyor belt by comparing barcode hash values first before opening the box to inspect details.',
    stepByStepLogic: [
      '1. Compute hash of the pattern and the initial window of text using polynomial rolling hash.',
      '2. Slide the window one character at a time.',
      '3. If hash(text_window) == hash(pattern), perform character comparison.',
      '4. Update rolling hash in O(1): subtract leading character and add trailing character.',
      '5. Repeat until end of text.'
    ],
    pythonCode: `# Rabin-Karp Algorithm
def rabin_karp(pattern, text, q=101):
    d = 256
    m = len(pattern)
    n = len(text)
    p = 0
    t = 0
    h = 1
    matches = []
    for i in range(m - 1): h = (h * d) % q
    for i in range(m):
        p = (d * p + ord(pattern[i])) % q
        t = (d * t + ord(text[i])) % q
    for i in range(n - m + 1):
        if p == t:
            if text[i:i + m] == pattern:
                matches.append(i)
        if i < n - m:
            t = (d * (t - ord(text[i]) * h) + ord(text[i + m])) % q
            if t < 0: t += q
    return matches

print("Rabin-Karp Matches:", rabin_karp("GEEK", "GEEKS FOR GEEKS"))
`
  },
  {
    id: 'z-algorithm',
    name: 'Z Algorithm',
    category: 'String & Pattern Matching Algorithms',
    complexity: { time: 'O(N + M)', space: 'O(N + M)' },
    explanation: 'Computes an array Z where Z[i] is the length of the longest substring starting at s[i] that is also a prefix of s, in linear time.',
    realWorldExample: 'Comparing the lyrics of an echoing song to find how many continuous lines from the opening verse repeat at any later moment.',
    stepByStepLogic: [
      '1. Concatenate string: S = pattern + "$" + text.',
      '2. Maintain a [L, R] interval representing the rightmost segment matching a prefix.',
      '3. For i from 1 to len(S) - 1: if i > R, compute Z[i] naively and update [L, R].',
      '4. If i <= R, use previously computed values: k = i - L; if Z[k] < R - i + 1, set Z[i] = Z[k]; else expand matching rightwards.',
      '5. Any index where Z[i] == len(pattern) corresponds to an occurrence.'
    ],
    pythonCode: `# Z Algorithm
def get_z_array(s):
    n = len(s)
    z = [0] * n
    l, r, k = 0, 0, 0
    for i in range(1, n):
        if i > r:
            l, r = i, i
            while r < n and s[r - l] == s[r]: r += 1
            z[i] = r - l
            r -= 1
        else:
            k = i - l
            if z[k] < r - i + 1:
                z[i] = z[k]
            else:
                l = i
                while r < n and s[r - l] == s[r]: r += 1
                z[i] = r - l
                r -= 1
    return z

def z_search(pattern, text):
    concat = pattern + "$" + text
    z = get_z_array(concat)
    matches = []
    for i in range(len(concat)):
        if z[i] == len(pattern):
            matches.append(i - len(pattern) - 1)
    return matches

print("Z Matches:", z_search("aba", "ababaaba"))
`
  },
  {
    id: 'boyer-moore',
    name: 'Boyer-Moore Algorithm',
    category: 'String & Pattern Matching Algorithms',
    complexity: { time: 'O(N / M) best / O(N · M) worst', space: 'O(Alphabet)' },
    explanation: 'Scans pattern characters from right to left, utilizing Bad Character and Good Suffix heuristics to make large multi-character jumps across the text.',
    realWorldExample: 'Fast-forwarding through a recorded video tape by jumping ahead in leaps whenever a mismatched scene immediately confirms the segment does not belong.',
    stepByStepLogic: [
      '1. Precompute Bad Character table (last occurrence of each character in pattern).',
      '2. Align pattern with text and scan from right to left (j = m - 1 down to 0).',
      '3. Upon mismatch text[i + j] != pattern[j], shift pattern by max(1, j - bad_char[text[i + j]]).',
      '4. If all characters match, record index and shift pattern.'
    ],
    pythonCode: `# Boyer-Moore (Bad Character Heuristic)
def bad_char_heuristic(pattern):
    bad_char = [-1] * 256
    for i in range(len(pattern)):
        bad_char[ord(pattern[i])] = i
    return bad_char

def boyer_moore_search(pattern, text):
    m = len(pattern)
    n = len(text)
    bad_char = bad_char_heuristic(pattern)
    matches = []
    s = 0
    while s <= n - m:
        j = m - 1
        while j >= 0 and pattern[j] == text[s + j]:
            j -= 1
        if j < 0:
            matches.append(s)
            s += (m - bad_char[ord(text[s + m])] if s + m < n else 1)
        else:
            s += max(1, j - bad_char[ord(text[s + j])])
    return matches

print("Boyer-Moore Matches:", boyer_moore_search("ABC", "ABAAABCDABC"))
`
  },
  {
    id: 'aho-corasick',
    name: 'Aho-Corasick Algorithm',
    category: 'String & Pattern Matching Algorithms',
    complexity: { time: 'O(N + Matches)', space: 'O(TotalPatternLength)' },
    explanation: 'Constructs a trie with failure and output transition links to locate all occurrences of multiple dictionary patterns simultaneously in a single text pass.',
    realWorldExample: 'A spam filter scanning an email in a single reading pass to detect hundreds of banned keywords at the same time.',
    stepByStepLogic: [
      '1. Build a Trie from all keyword patterns.',
      '2. Construct failure links using BFS (similar to KMP LPS transitions across multiple branches).',
      '3. Stream text through the automaton: follow trie edges or fallback along failure links.',
      '4. Collect all matched patterns attached to visited states.'
    ],
    pythonCode: `# Aho-Corasick Trie Construction Outline
from collections import deque

class AhoNode:
    def __init__(self):
        self.children = {}
        self.fail = None
        self.output = []

def build_aho_trie(words):
    root = AhoNode()
    for w in words:
        cur = root
        for ch in w:
            cur = cur.children.setdefault(ch, AhoNode())
        cur.output.append(w)
    return root

root_node = build_aho_trie(["he", "she", "his", "hers"])
print("Aho-Corasick Root Children:", list(root_node.children.keys()))
`
  },
  {
    id: 'manachers-algorithm',
    name: 'Manacher’s Algorithm',
    category: 'String & Pattern Matching Algorithms',
    complexity: { time: 'O(N)', space: 'O(N)' },
    explanation: 'Finds the longest palindromic substring in strictly linear O(N) time by transforming the string with delimiters and exploiting symmetry inside previously expanded palindrome radii.',
    realWorldExample: 'Folding an origami paper fan in half along its central crease to predict the matching pattern on the right without measuring it twice.',
    stepByStepLogic: [
      '1. Transform string by inserting separator # between characters (e.g. "aba" -> "^#a#b#a#$").',
      '2. Maintain center C and right boundary R of the palindrome that extends furthest.',
      '3. For each i: if i < R, mirror index i_mirror = 2C - i; initialize P[i] = min(R - i, P[i_mirror]).',
      '4. Expand centered at i while characters match.',
      '5. If i + P[i] > R, update center C = i and right boundary R = i + P[i].'
    ],
    pythonCode: `# Manacher's Algorithm
def longest_palindrome(s):
    t = '^#' + '#'.join(s) + '#$'
    n = len(t)
    p = [0] * n
    c = r = 0
    for i in range(1, n - 1):
        i_mirror = 2 * c - i
        if r > i:
            p[i] = min(r - i, p[i_mirror])
        while t[i + 1 + p[i]] == t[i - 1 - p[i]]:
            p[i] += 1
        if i + p[i] > r:
            c = i
            r = i + p[i]
    max_len, center_idx = max((val, idx) for idx, val in enumerate(p))
    start = (center_idx - max_len) // 2
    return s[start:start + max_len]

print("Longest Palindrome:", longest_palindrome("babad"))
`
  },
  {
    id: 'suffix-array',
    name: 'Suffix Array Construction',
    category: 'String & Pattern Matching Algorithms',
    complexity: { time: 'O(N log N)', space: 'O(N)' },
    explanation: 'Constructs an array of integers representing the starting indices of all sorted suffixes of a string, fundamental for high-speed full-text indexing.',
    realWorldExample: 'A book index compiling every phrase in a textbook alphabetically along with their page numbers for instant lookups.',
    stepByStepLogic: [
      '1. Generate all suffixes of string S with their starting indices.',
      '2. Sort the suffixes lexicographically (optimized via prefix doubling).',
      '3. Suffix array stores the sorted index sequence.'
    ],
    pythonCode: `# Suffix Array Construction
def build_suffix_array(s):
    suffixes = sorted((s[i:], i) for i in range(len(s)))
    return [suffix[1] for suffix in suffixes]

text = "banana"
print("Suffix Array of 'banana':", build_suffix_array(text))
`
  },
  {
    id: 'kasais-algorithm',
    name: 'Kasai’s Algorithm',
    category: 'String & Pattern Matching Algorithms',
    complexity: { time: 'O(N)', space: 'O(N)' },
    explanation: 'Constructs the Longest Common Prefix (LCP) array from a suffix array in linear time O(N) by recognizing that LCP decreases by at most 1 when advancing to the next suffix in text order.',
    realWorldExample: 'Comparing adjacent words in a dictionary where consecutive words almost always share common starting root letters.',
    stepByStepLogic: [
      '1. Compute the inverse suffix array: rank[sa[i]] = i.',
      '2. Initialize h = 0.',
      '3. For i from 0 to n - 1: if rank[i] > 0, compare suffix i with predecessor suffix in SA.',
      '4. While characters match, increment h.',
      '5. lcp[rank[i]] = h; if h > 0, decrement h -= 1.'
    ],
    pythonCode: `# Kasai's LCP Array Algorithm
def kasai(s, sa):
    n = len(s)
    k = 0
    lcp = [0] * n
    rank = [0] * n
    for i in range(n): rank[sa[i]] = i
    for i in range(n):
        if rank[i] == 0: continue
        j = sa[rank[i] - 1]
        while i + k < n and j + k < n and s[i + k] == s[j + k]:
            k += 1
        lcp[rank[i]] = k
        if k > 0: k -= 1
    return lcp

word = "banana"
sa = [5, 3, 1, 0, 4, 2] # Suffix array for banana
print("LCP Array:", kasai(word, sa))
`
  },
  {
    id: 'ukkonens-algorithm',
    name: 'Ukkonen’s Algorithm',
    category: 'String & Pattern Matching Algorithms',
    complexity: { time: 'O(N)', space: 'O(N)' },
    explanation: 'An online algorithm that constructs a Suffix Tree in strictly linear time O(N) by incrementally processing characters from left to right with active points and suffix links.',
    realWorldExample: 'A live stenographer typing a court transcript while an automated indexing system indexes all substrings in real time as each letter is pressed.',
    stepByStepLogic: [
      '1. Process string character by character.',
      '2. Maintain active_node, active_edge, active_length, and remainder.',
      '3. Apply extension rules to insert new suffix branches or split existing edges.',
      '4. Create suffix links from newly created internal nodes to speed up subsequent insertions.'
    ],
    pythonCode: `# Ukkonen's Algorithm Active Point Concept
class ActivePoint:
    def __init__(self, node=0, edge='', length=0):
        self.node = node
        self.edge = edge
        self.length = length

ap = ActivePoint()
print(f"Ukkonen Active Point: node={ap.node}, edge='{ap.edge}', length={ap.length}")
`
  }
];
