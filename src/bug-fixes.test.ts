import { beforeAll, describe, expect, it } from 'vitest';
import { loadPyodide, type PyodideInterface } from 'pyodide';
import { buildTraceProgram, attachDataStructure, type TraceEvent } from './trace';

let python: PyodideInterface;
let motionCss = '';
let graphCss = '';
let stylesCss = '';

beforeAll(async () => {
  python = await loadPyodide();
  // @ts-ignore
  const fs = await import('node:fs');
  motionCss = fs.readFileSync(new URL('./motion.css', import.meta.url), 'utf-8');
  graphCss = fs.readFileSync(new URL('./graph.css', import.meta.url), 'utf-8');
  stylesCss = fs.readFileSync(new URL('./styles.css', import.meta.url), 'utf-8');
}, 30_000);

async function run(code: string): Promise<TraceEvent[]> {
  const result = await python.runPythonAsync(buildTraceProgram(code));
  const raw = JSON.parse(String(result)) as Array<Omit<TraceEvent, 'structure'>>;
  return attachDataStructure(raw, code);
}

describe('Four bug fixes verification', () => {
  it('Bug 1: yellow active nodes have high-contrast black text and revert on normal state', () => {
    // CSS rules verify yellow node styling and black text
    expect(graphCss).toContain('.tree-node.active-node{fill:#d7f675');
    expect(motionCss).toMatch(/\.active-node-label\s*\{[^}]*fill:\s*#000000\s*!important/);
    expect(stylesCss).toContain('.active-node-label{fill:#000000!important}');
  });

  it('Bug 2: Complexity analyzer never returns or displays O(?) for time or space complexity', async () => {
    const codeWithEdgeCases = `
# Unrecognized or unusual syntax statements
pass
x = 42
def custom_helper(a, b):
    return a + b
result = custom_helper(x, 10)
`;
    const events = await run(codeWithEdgeCases);

    expect(events.length).toBeGreaterThan(0);
    for (const event of events) {
      expect(event.lineComplexity).toBeDefined();
      expect(event.lineComplexity.time).not.toBe('O(?)');
      expect(event.lineComplexity.space).not.toBe('O(?)');
      expect(event.lineComplexity.time).not.toBe('?');
      expect(event.lineComplexity.space).not.toBe('?');
      expect(event.lineComplexity.timeDetails).not.toContain('not covered by the generic AST cost rules');
      expect(event.lineComplexity.spaceDetails).not.toContain('not covered by the generic AST cost rules');
    }
  });

  it('Bug 3: Recursion call stack layout has no strict fixed height or internal scrollbar', () => {
    // Styles override max-height and overflow
    expect(motionCss).toMatch(/\.recursion-view[^{]*\{[^}]*max-height:\s*none/);
    expect(motionCss).toMatch(/\.recursion-view[^{]*\{[^}]*overflow:\s*visible/);
    expect(stylesCss).toContain('.recursion-view.call-stack{max-height:none;overflow:visible');

    // Neither specifies overflow-y: scroll for recursion-view
    expect(motionCss).not.toMatch(/\.recursion-view[^{]*\{[^}]*overflow-y:\s*scroll/);
    expect(stylesCss).not.toMatch(/\.recursion-view[^{]*\{[^}]*overflow-y:\s*scroll/);
  });

  it('Bug 4: String visualizer displays horizontally with flex-row and animates search operations', async () => {
    // CSS layout has flex-direction: row for string cells
    expect(motionCss).toMatch(/\.string-cells\s*\{[^}]*flex-direction:\s*row/);
    expect(stylesCss).toContain('.string-cells{display:flex;flex-direction:row');

    // Run string search algorithm and ensure events are properly tagged
    const searchCode = `text = "trace the pattern"\npattern = "pattern"\nfor index in range(len(text) - len(pattern) + 1):\n    if text[index:index + len(pattern)] == pattern:\n        found_at = index\n        break`;
    const events = await run(searchCode);

    const compareEvents = events.filter(e => e.operation === 'compare');
    expect(compareEvents.length).toBeGreaterThan(0);
    expect(compareEvents[0].focus.indices?.length).toBeGreaterThan(0);

    const matchEvent = events.find(e => e.statement?.includes('found_at = index'));
    expect(matchEvent).toBeDefined();
    expect(matchEvent?.variables.found_at).toBe(10);
  });
});
