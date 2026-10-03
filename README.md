# ChronoNode - Advanced Python DSA Visualizer

> **ChronoNode** turns Python data-structure and algorithm code into an inspectable, step-by-step execution trace.

[![Verify](https://github.com/Sangchi-ui/ChronoNode/actions/workflows/ci.yml/badge.svg)](https://github.com/Sangchi-ui/ChronoNode/actions/workflows/ci.yml)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111)](https://react.dev/)
[![Vite 6](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Python runtime](https://img.shields.io/badge/Python-Pyodide%200.26.2-3776AB?logo=python&logoColor=white)](https://pyodide.org/)
[![License](https://img.shields.io/badge/license-not%20specified-lightgrey)](#license)

ChronoNode executes Python in the browser with Pyodide, captures meaningful runtime events, and replays them alongside the source. It does not play prerecorded algorithm animations: visual states come from the code that actually ran. Per-step time and space estimates use AST patterns and runtime collection sizes where the operation is recognized; unrecognized operations gracefully use safe constant fallback estimates (`O(1)`) with descriptive context.

## Highlights

- **Interactive Pan & Zoom Canvas:** Infinite canvas navigation with click-and-drag panning, mouse wheel / pinch zooming, zoom controls, and a dedicated View Lock toggle to freeze canvas adjustments while stepping through algorithm execution.
- **Runtime tracing:** assignments, state mutations, comparisons, branches, calls, returns, and captured output.
- **Noise filtering:** suppresses imports, definitions, built-in frames, and hidden comprehension frames from the user-facing trace.
- **Domain routing:** backend events carry a primary `dataStructure` tag, checked against the frontend dispatcher.
- **Step complexity:** shows time and auxiliary-space estimates for the selected event, including measured `K` for supported collection operations, with safe `O(1)` fallbacks.
- **High-contrast visualizers:** dynamic high-contrast node contrast, natural-width horizontal string visualizer without native scrollbars, and dedicated panels for textual step output.
- **Safe snapshots:** bounds nested state, handles cycles, non-finite numbers, and objects with failing representations.
- **Presentation Mode:** HTML5 Full-Screen API for the central `<ChronoEngine />`, preserving all timeline, zoom, odometer telemetry, and playback controls for classroom smart board use.
- **Algorithm Detail Page Parity:** Edge-to-edge 40/60 split-pane workspace with KaTeX mathematical typography and responsive multi-line category chip navigation.
- **Execution limits:** defaults to at most 1,000 events and a 5-second in-tracer deadline, with a worker timeout as an additional guard.
- **Replay tools:** move through events, inspect before/after state, view variables and call frames, and jump through the trace.

## Audited Problem Families

The deployment harness executes representative snippets for each family below and checks trace validity, the expected primary route, registered dispatcher coverage, source-line bounds, noise filtering, sanitized state, and complexity metadata. This is representative coverage, not a proof that every algorithm variant has a bespoke visual treatment.

| # | Family | Example coverage |
|---:|---|---|
| 1 | Foundations and bitwise operations | Masks, XOR, shifts, set-bit counting |
| 2 | Arrays and array techniques | Multidimensional arrays, two pointers, sliding windows |
| 3 | Strings | Palindromes, prefix matching, KMP-style state |
| 4 | Linked lists | Singly linked and circular references |
| 5 | Stacks | Monotonic-stack operations and object-backed stacks |
| 6 | Queues | Queue and deque operations |
| 7 | Hashing | Frequency maps and sets |
| 8 | Searching | Binary search |
| 9 | Sorting | Comparison sorting and swaps |
| 10 | Recursion and backtracking | Recursive subset generation and call frames |
| 11 | Trees | Binary tree nodes and links |
| 12 | Binary search trees | Iterative inorder traversal with a helper stack |
| 13 | Heaps | Heapify and priority-queue operations |
| 14 | Tries | Custom nodes with child maps |
| 15 | Graphs | BFS and adjacency structures |
| 16 | Shortest paths | Distance-map relaxation |
| 17 | Minimum spanning trees and DSU | Parent/rank updates |
| 18 | Advanced graphs | Discovery/low-link traversal state |
| 19 | Greedy algorithms | Interval scheduling |
| 20 | Dynamic programming | Two-dimensional knapsack table |
| 21 | Divide and conquer | Recursive merge sort |
| 22 | Range queries | Fenwick-tree updates |
| 23 | Advanced strings | Prefix-function / LPS state |
| 24 | Mathematical algorithms | Euclidean GCD |
| 25 | Computational geometry | Point orientation and cross products |
| 26 | Advanced data structures | AVL-style node objects |
| 27 | Bitwise algorithms | Bitmask transformations |
| 28 | Randomized algorithms | Reservoir-sampling pattern |
| 29 | Advanced techniques | Block-ordered range-query pattern |
| 30 | Problem-solving patterns | Frequency counting |

## Visualizer Coverage

The current canvas components are indexed arrays/matrices, strings, linked nodes, binary trees, tries, heaps, graphs, stacks, queues/deques, mappings, bitwise registers, coordinate plots, recursion frames, and structured variable summaries. Related problem families intentionally share the closest data-structure canvas; for example, shortest-path and MST traces use the graph canvas, while sorting and searching traces use the array canvas. The route table is in [`src/visualizer-routing.ts`](src/visualizer-routing.ts), and the canvas dispatcher is in [`src/main.tsx`](src/main.tsx).

When intent cannot be inferred reliably from code and state, the UI uses a formatted variable summary rather than dumping raw JSON. Add an annotation when a custom structure needs a specific route:

```python
@visualize deque worklist
from collections import deque

worklist = deque(["start"])
worklist.appendleft("priority")
```

## Quick Start

Requirements: Node.js 20 or newer and npm. The browser needs network access to load the Pyodide runtime from jsDelivr on first use.

```bash
git clone https://github.com/Sangchi-ui/ChronoNode.git
cd ChronoNode
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`, choose an example or enter Python code, then select **Run code**.

## Verify and Build

```bash
npm test
npm run lint
npm run build
```

The test suite runs the tracer in Pyodide, including the 30-family deployment audit. The production build writes static assets to `dist/`:

```bash
npm run preview
```

The GitHub Actions workflow runs tests, TypeScript checks, and the production build for pushes to `main` and pull requests.

## Runtime and Complexity Notes

The tracer records source-line-level operations, not every Python bytecode instruction. Standard-library implementation frames and built-in function frames are excluded; operations such as `sum(values)` are represented at the user source line. Each event carries the original source location, before/after snapshots, a `dataStructure` route tag, and `lineComplexity` (`time`, `timeDetails`, `space`, `spaceDetails`). Recognized slices, reductions, concatenations, list operations, and selected built-ins report runtime collection sizes. These are operation-level estimates, not a static proof of the whole algorithm's asymptotic complexity.

Pyodide runs in a Web Worker and is stopped by event, traced-callback, recursion, and time limits. This is an educational execution environment, not a security sandbox; only run code you trust.

## Credits and License

Created by **Jeevan**. The repository does not currently declare a license; all rights remain with the copyright holder until a license is added.