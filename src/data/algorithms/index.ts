import type { AlgorithmData } from './types';
import { searchingAlgorithms } from './searching';
import { sortingAlgorithms } from './sorting';
import { arrayPointerSlidingAlgorithms } from './arrays-pointers-sliding';
import { graphAlgorithms } from './graph';
import { treeAlgorithms } from './trees';
import { dynamicProgrammingAlgorithms } from './dynamic-programming';
import { greedyAlgorithms } from './greedy';
import { stringAlgorithms } from './strings';
import { mathNumberTheoryAlgorithms } from './math-number-theory';
import { divideAndConquerAlgorithms } from './divide-and-conquer';
import { backtrackingAlgorithms } from './backtracking';
import { bitManipulationAlgorithms } from './bit-manipulation';
import { geometryAlgorithms } from './geometry';
import { randomizedHeuristicAlgorithms } from './randomized-heuristic';

export * from './types';

export const allAlgorithms: AlgorithmData[] = [
  ...searchingAlgorithms,
  ...sortingAlgorithms,
  ...arrayPointerSlidingAlgorithms,
  ...graphAlgorithms,
  ...treeAlgorithms,
  ...dynamicProgrammingAlgorithms,
  ...greedyAlgorithms,
  ...stringAlgorithms,
  ...mathNumberTheoryAlgorithms,
  ...divideAndConquerAlgorithms,
  ...backtrackingAlgorithms,
  ...bitManipulationAlgorithms,
  ...geometryAlgorithms,
  ...randomizedHeuristicAlgorithms,
];

export const algorithmCategories: string[] = [
  'All',
  'Searching Algorithms',
  'Sorting Algorithms',
  'Array, Two-Pointer, and Sliding Window Algorithms',
  'Graph Algorithms',
  'Tree Algorithms',
  'Dynamic Programming (DP) Algorithms',
  'Greedy Algorithms',
  'String & Pattern Matching Algorithms',
  'Mathematical & Number Theory Algorithms',
  'Divide and Conquer Algorithms',
  'Backtracking Algorithms',
  'Bit Manipulation Algorithms',
  'Computational Geometry Algorithms',
  'Randomized & Heuristic Algorithms',
];

export const ALL_ALGORITHMS = allAlgorithms;
export const ALGORITHM_CATEGORIES = algorithmCategories.filter(c => c !== 'All');

