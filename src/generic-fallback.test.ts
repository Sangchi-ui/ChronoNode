import { beforeAll, describe, expect, it } from 'vitest';
import { loadPyodide, type PyodideInterface } from 'pyodide';
import { attachDataStructure, buildTraceProgram, type TraceEvent } from './trace';
import { resolveVisualizerRoute } from './visualizer-routing';
import pkg from '../package.json';

let python: PyodideInterface;
beforeAll(async () => {
  python = await loadPyodide();
}, 30_000);

async function run(code: string): Promise<TraceEvent[]> {
  const runner = buildTraceProgram(code);
  const raw = await python.runPythonAsync(runner);
  const parsed = JSON.parse(String(raw));
  return attachDataStructure(parsed, code);
}

const readWorkspaceFile = async (relative: string): Promise<string> => {
  const fs: any = await import('node:fs' as string);
  const path: any = await import('node:path' as string);
  const cwd = (globalThis as any).process?.cwd?.() || '.';
  return fs.readFileSync(path.resolve(cwd, relative), 'utf-8');
};

describe('Project Rebrand to ChronoNode', () => {
  it('updates package.json name to chrononode', () => {
    expect(pkg.name).toBe('chrononode');
  });

  it('updates index.html title to ChronoNode', async () => {
    const html = await readWorkspaceFile('index.html');
    expect(html).toContain('<title>ChronoNode - Advanced Python DSA Visualizer</title>');
    expect(html.toLowerCase()).not.toContain('traceforge');
  });

  it('updates README.md to display ChronoNode', async () => {
    const readme = await readWorkspaceFile('README.md');
    expect(readme).toContain('# ChronoNode');
    expect(readme.toLowerCase()).not.toContain('traceforge');
  });
});

describe('Clean Message Formatting (No Raw JSON Dumps)', () => {
  it('simplifies TreeNode and custom objects without recursive JSON dumps', async () => {
    const code = `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class BSTIterator:
    def __init__(self, root):
        self.stack = [root]

node = TreeNode(4)
it = BSTIterator(node)
if node == it:
    pass
`;
    const events = await run(code);
    expect(events.length).toBeGreaterThan(0);

    for (const ev of events) {
      if (ev.message) {
        expect(ev.message).not.toContain("{'__type__':");
        expect(ev.message).not.toContain('{"__type__":');
      }
      if (ev.explanation) {
        expect(ev.explanation).not.toContain("{'__type__':");
        expect(ev.explanation).not.toContain('{"__type__":');
      }
    }

    const compareEvent = events.find(e => e.eventType === 'compare' || e.operation === 'compare');
    expect(compareEvent).toBeDefined();
    expect(compareEvent?.explanation).toMatch(/TreeNode\(val=4\)|<BSTIterator>/);
    expect(compareEvent?.message).toMatch(/TreeNode\(val=4\)|<BSTIterator>/);
  });
});

describe('Generic Fallback Mode for Unsupported / Arbitrary Code', () => {
  it('tags non-DSA random code with visualizerType: "generic"', async () => {
    const code = `
user_age = 25
user_name = "Alice"
is_subscribed = True
ratio = user_age / 2
`;
    const events = await run(code);
    expect(events.length).toBeGreaterThan(0);
    const firstStep = events[0];
    expect(firstStep.visualizerType).toBe('generic');
    expect(firstStep.dataStructure).toBe('generic');
    expect(resolveVisualizerRoute(firstStep.dataStructure)).toBe('generic');
  });

  it('tracks line-by-line variable updates in generic mode', async () => {
    const code = `
x = 10
y = 20
z = x + y
`;
    const events = await run(code);
    const assignEvents = events.filter(e => e.operation === 'assign');
    expect(assignEvents.length).toBeGreaterThanOrEqual(3);
    const lastAssign = assignEvents.at(-1);
    expect(lastAssign?.variables.z).toBe(30);
  });
});

describe('Safe Sandboxing and UI Error Surfacing', () => {
  it('catches IndexError and surfaces clean formatted error event', async () => {
    const code = `
items = [1, 2, 3]
bad_item = items[10]
`;
    const events = await run(code);
    const errorEvent = events.at(-1);
    expect(errorEvent).toBeDefined();
    expect(errorEvent?.eventType).toBe('error');
    expect(errorEvent?.explanation).toMatch(/Execution Error:.*list index out of range at line 3/);
    expect(errorEvent?.message).toMatch(/Execution Error:.*list index out of range at line 3/);
  });

  it('catches ZeroDivisionError gracefully', async () => {
    const code = `
a = 10
b = 0
c = a / b
`;
    const events = await run(code);
    const errorEvent = events.at(-1);
    expect(errorEvent).toBeDefined();
    expect(errorEvent?.eventType).toBe('error');
    expect(errorEvent?.explanation).toContain('division by zero');
    expect(errorEvent?.explanation).toContain('at line 4');
  });

  it('catches SyntaxError gracefully without crashing the frontend', async () => {
    const code = `
def broken_syntax(
`;
    const events = await run(code);
    expect(events.length).toBeGreaterThan(0);
    const errorEvent = events.at(-1);
    expect(errorEvent).toBeDefined();
    expect(errorEvent?.eventType).toBe('error');
    expect(errorEvent?.explanation).toContain('Execution Error:');
  });
});
