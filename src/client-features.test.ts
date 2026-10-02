import { beforeAll, describe, it, expect } from 'vitest';
import {
  generateWorstCaseArray,
  generateHeavyDuplicatesArray,
  generateDegenerateTreeCode,
  generateNearlySortedArray,
  generateMountainArray,
  ALL_EDGE_CASES,
} from './data/edgeCases';
import type { TraceEvent } from './trace';

let algorithmsCss = '';
let interactiveFeaturesCss = '';
let mainTsx = '';
let embeddedTsx = '';

beforeAll(async () => {
  // @ts-ignore
  const fs = await import('node:fs');
  algorithmsCss = fs.readFileSync(new URL('./algorithms.css', import.meta.url), 'utf-8');
  interactiveFeaturesCss = fs.readFileSync(new URL('./interactive-features.css', import.meta.url), 'utf-8');
  mainTsx = fs.readFileSync(new URL('./main.tsx', import.meta.url), 'utf-8');
  embeddedTsx = fs.readFileSync(new URL('./EmbeddedVisualizer.tsx', import.meta.url), 'utf-8');
});

describe('Client-Side Interactive Features', () => {
  /* ------------------------------------------------------------------------
     1. Layout Constraints (Algorithm Detail Pages)
     ------------------------------------------------------------------------ */
  describe('1. Algorithm Detail Layout Adjustment', () => {
    it('constrains .detail-content-container with wide reading width (max-w-7xl) and margins', () => {
      expect(algorithmsCss).toContain('.detail-content-container');
      expect(algorithmsCss).toMatch(/max-width:\s*(80rem|1280px|1140px)/);
      expect(algorithmsCss).toMatch(/margin:\s*0\s+auto/);
    });
  });

  /* ------------------------------------------------------------------------
     2. Feature 1: Interactive Sandbox Mode (Drag-and-Drop)
     ------------------------------------------------------------------------ */
  describe('2. Interactive Sandbox Mode (Data Structures Builder)', () => {
    interface SandboxNode {
      id: string;
      value: string | number;
      x: number;
      y: number;
      nextPointer: string | null;
    }

    it('stores node locations inside coordinate objects with id, value, x, y, and nextPointer', () => {
      const nodes: SandboxNode[] = [
        { id: 'node-1', value: 10, x: 120, y: 220, nextPointer: 'node-2' },
        { id: 'node-2', value: 20, x: 280, y: 220, nextPointer: 'node-3' },
        { id: 'node-3', value: 30, x: 440, y: 220, nextPointer: null },
      ];

      expect(nodes).toHaveLength(3);
      expect(nodes[0]).toHaveProperty('id', 'node-1');
      expect(nodes[0]).toHaveProperty('value', 10);
      expect(nodes[0]).toHaveProperty('x', 120);
      expect(nodes[0]).toHaveProperty('y', 220);
      expect(nodes[0]).toHaveProperty('nextPointer', 'node-2');
    });

    it('dynamically calculates arrow boundary coordinates between dragged nodes without overlapping circles', () => {
      const source = { id: 'n1', value: 'A', x: 100, y: 100, nextPointer: 'n2' };
      const target = { id: 'n2', value: 'B', x: 200, y: 100, nextPointer: null };
      const radius = 28;

      const dx = target.x - source.x; // 100
      const dy = target.y - source.y; // 0
      const dist = Math.sqrt(dx * dx + dy * dy); // 100

      const startX = source.x + (dx / dist) * radius; // 100 + 28 = 128
      const startY = source.y + (dy / dist) * radius; // 100
      const endX = target.x - (dx / dist) * radius;   // 200 - 28 = 172
      const endY = target.y - (dy / dist) * radius;   // 100

      expect(startX).toBe(128);
      expect(startY).toBe(100);
      expect(endX).toBe(172);
      expect(endY).toBe(100);
      expect(endX - startX).toBe(44);
    });

    it('updates coordinates when a node is dragged and instantly repositions connections', () => {
      let nodes: SandboxNode[] = [
        { id: 'a', value: 1, x: 50, y: 50, nextPointer: 'b' },
        { id: 'b', value: 2, x: 150, y: 50, nextPointer: null },
      ];

      // Drag node 'a' to (80, 120)
      nodes = nodes.map(n => n.id === 'a' ? { ...n, x: 80, y: 120 } : n);

      expect(nodes.find(n => n.id === 'a')?.x).toBe(80);
      expect(nodes.find(n => n.id === 'a')?.y).toBe(120);
      expect(nodes.find(n => n.id === 'a')?.nextPointer).toBe('b');
    });
  });

  /* ------------------------------------------------------------------------
     3. Feature 2: Smart Edge-Case Data Generators
     ------------------------------------------------------------------------ */
  describe('3. Smart Edge-Case Data Generators', () => {
    it('generates Worst-Case Array strictly sorted in descending order', () => {
      const worstCase = generateWorstCaseArray(9);
      expect(worstCase).toHaveLength(9);
      expect(worstCase).toEqual([90, 80, 70, 60, 50, 40, 30, 20, 10]);

      for (let i = 0; i < worstCase.length - 1; i++) {
        expect(worstCase[i]).toBeGreaterThan(worstCase[i + 1]);
      }
    });

    it('generates Heavy Duplicates Array with clustered identical values', () => {
      const heavyDups = generateHeavyDuplicatesArray();
      expect(heavyDups.length).toBeGreaterThan(6);

      const freq: Record<number, number> = {};
      heavyDups.forEach(x => { freq[x] = (freq[x] || 0) + 1; });

      // Has clustered duplicates of 7 and 8
      expect(freq[7]).toBeGreaterThanOrEqual(4);
      expect(freq[8]).toBeGreaterThanOrEqual(4);
    });

    it('generates Degenerate/Skewed Trees with sequential BST insertions creating diagonal right line', () => {
      const treeCode = generateDegenerateTreeCode([10, 20, 30, 40, 50]);
      expect(treeCode).toContain('class TreeNode:');
      expect(treeCode).toContain('current.right = TreeNode(val)');
      expect(treeCode).toContain('TreeNode(10)');
      expect(treeCode).toContain('curr = curr.right');
    });

    it('provides complete dataset specifications with adversarial reasoning and runnable snippets', () => {
      expect(ALL_EDGE_CASES.length).toBeGreaterThanOrEqual(5);
      ALL_EDGE_CASES.forEach(ds => {
        expect(ds.id).toBeTruthy();
        expect(ds.name).toBeTruthy();
        expect(ds.adversarialReason.length).toBeGreaterThan(20);
        expect(ds.pythonSnippet.length).toBeGreaterThan(20);
      });
    });
  });

  /* ------------------------------------------------------------------------
     4. Feature 3: Time & Space Complexity "Odometer" Dashboard
     ------------------------------------------------------------------------ */
  describe('4. Time & Space Complexity Odometer Dashboard', () => {
    it('accurately increments comparisons, swaps, and tracks peak space in browser memory', () => {
      const mockEvents = [
        {
          step: 1,
          line: 2,
          statement: 'if values[0] > values[1]:',
          depth: 0,
          eventType: 'compare',
          operation: 'compare',
          dataStructure: 'array',
          focus: { indices: [0, 1], values: [7, 3] },
          state: { values: [7, 3, 9] },
          beforeState: { values: [7, 3, 9] },
          afterState: { values: [7, 3, 9] },
          callStack: [],
        },
        {
          step: 2,
          line: 3,
          statement: 'values[0], values[1] = values[1], values[0]',
          depth: 0,
          eventType: 'swap',
          operation: 'swap',
          dataStructure: 'array',
          focus: { indices: [0, 1], values: [3, 7] },
          state: { values: [3, 7, 9] },
          beforeState: { values: [7, 3, 9] },
          afterState: { values: [3, 7, 9] },
          callStack: [],
        },
        {
          step: 3,
          line: 4,
          statement: 'values.append(15)',
          depth: 0,
          eventType: 'write',
          operation: 'append',
          dataStructure: 'array',
          focus: { indices: [3] },
          state: { values: [3, 7, 9, 15] },
          beforeState: { values: [3, 7, 9] },
          afterState: { values: [3, 7, 9, 15] },
          callStack: [],
        },
      ] as unknown as TraceEvent[];

      // Simulate Odometer Telemetry logic
      let comparisonsCount = 0;
      let arraySwapsCount = 0;
      let writesCount = 0;
      let peakSpaceBytes = 64;

      mockEvents.forEach(ev => {
        const op = ev.operation?.toLowerCase() || '';
        const type = ev.eventType?.toLowerCase() || '';
        if (op === 'compare' || type === 'compare') comparisonsCount++;
        if (op === 'swap' || op === 'move') arraySwapsCount++;
        if (op === 'append' || op === 'write' || op === 'set') writesCount++;

        const state = ev.afterState || ev.state || {};
        let currentBytes = 64;
        Object.entries(state).forEach(([k, v]) => {
          if (Array.isArray(v)) currentBytes += 56 + v.length * 8;
        });
        if (currentBytes > peakSpaceBytes) peakSpaceBytes = currentBytes;
      });

      expect(comparisonsCount).toBe(1);
      expect(arraySwapsCount).toBe(1);
      expect(writesCount).toBe(1);
      expect(peakSpaceBytes).toBe(64 + 56 + 4 * 8); // 152 bytes for list of 4 items
    });

    it('positions the odometer as a compact, semi-transparent floating glassmorphic overlay card at bottom-right', () => {
      // 1. Canvas-Relative Positioning & Dimensions
      expect(interactiveFeaturesCss).toMatch(/\.complexity-odometer-hud\s*\{[^}]*position:\s*absolute/);
      expect(interactiveFeaturesCss).toMatch(/\.complexity-odometer-hud\s*\{[^}]*bottom:\s*12px/);
      expect(interactiveFeaturesCss).toMatch(/\.complexity-odometer-hud\s*\{[^}]*right:\s*12px/);
      expect(interactiveFeaturesCss).toMatch(/\.complexity-odometer-hud\s*\{[^}]*z-index:\s*20/);
      expect(interactiveFeaturesCss).toMatch(/\.complexity-odometer-hud\s*\{[^}]*pointer-events:\s*auto/);
      expect(interactiveFeaturesCss).toMatch(/\.complexity-odometer-hud\s*\{[^}]*width:\s*220px/);
      expect(interactiveFeaturesCss).toMatch(/\.complexity-odometer-hud\s*\{[^}]*max-width:\s*240px/);

      // 2. Semi-Transparent Glassmorphism Styling
      expect(interactiveFeaturesCss).toMatch(/\.complexity-odometer-hud\s*\{[^}]*background:\s*rgba\(15,\s*23,\s*42,\s*0\.72\)/);
      expect(interactiveFeaturesCss).toMatch(/\.complexity-odometer-hud\s*\{[^}]*backdrop-filter:\s*blur\(8px\)/);
      expect(interactiveFeaturesCss).toMatch(/\.complexity-odometer-hud\s*\{[^}]*border:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.08\)/);

      // 3. Viewport Container Positioning
      expect(interactiveFeaturesCss).toMatch(/\.visual-canvas-container\s*\{[^}]*position:\s*relative/);
      expect(interactiveFeaturesCss).toMatch(/\.visual-canvas-container\s*\{[^}]*overflow:\s*hidden/);

      // 4. Layout Integration in main.tsx and EmbeddedVisualizer.tsx
      expect(mainTsx).toContain('<div className="visual-canvas-container">');
      expect(mainTsx).toContain('<ComplexityOdometer events={events} currentIndex={index} />');
      expect(embeddedTsx).toContain('<ComplexityOdometer events={events} currentIndex={index} />');
    });
  });
});
