import { beforeAll, describe, expect, it } from 'vitest';
import { PanZoomCanvas } from './PanZoomCanvas';

let motionCss = '';
let stylesCss = '';
let mainTsx = '';
let panZoomTsx = '';

beforeAll(async () => {
  // @ts-ignore
  const fs = await import('node:fs');
  motionCss = fs.readFileSync(new URL('./motion.css', import.meta.url), 'utf-8');
  stylesCss = fs.readFileSync(new URL('./styles.css', import.meta.url), 'utf-8');
  mainTsx = fs.readFileSync(new URL('./main.tsx', import.meta.url), 'utf-8');
  panZoomTsx = fs.readFileSync(new URL('./PanZoomCanvas.tsx', import.meta.url), 'utf-8');
});

describe('Main canvas upgrade verification', () => {
  it('Criteria 1 & 2: PanZoomCanvas provides interactive pan & zoom, overlay controls, and a view-lock toggle', () => {
    expect(typeof PanZoomCanvas).toBe('function');

    // PanZoomCanvas contains zoom in, zoom out, reset, and lock controls
    expect(panZoomTsx).toContain('handleZoomIn');
    expect(panZoomTsx).toContain('handleZoomOut');
    expect(panZoomTsx).toContain('handleReset');
    expect(panZoomTsx).toContain('handleToggleLock');

    // Overlay buttons
    expect(panZoomTsx).toContain('title="Zoom In"');
    expect(panZoomTsx).toContain('title="Zoom Out"');
    expect(panZoomTsx).toContain('title="Reset View"');
    expect(panZoomTsx).toContain('title={isLocked ? \'Unlock View\' : \'Lock View\'}');

    // Lock freezing pan and zoom:
    // Dragging check
    expect(panZoomTsx).toMatch(/if\s*\(isLocked\)\s*return;/);
    // Wheel zoom check
    expect(panZoomTsx).toMatch(/const handleWheel\s*=\s*\(e:\s*WheelEvent\)\s*=>\s*\{[^}]*if\s*\(isLocked\)\s*return;/);
    // Zoom button disabled when locked
    expect(panZoomTsx).toContain('disabled={isLocked}');

    // CSS cursor and layout rules for canvas
    expect(stylesCss).toContain('.canvas{flex:1;min-height:260px;margin:16px 18px 8px;border:1px solid #293443;border-radius:10px;background-color:#121822;background-image:radial-gradient(#263142 1px,transparent 1px);background-size:22px 22px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;user-select:none}');
    expect(stylesCss).toContain('.canvas.is-locked{cursor:default!important}');
    expect(stylesCss).toContain('.canvas.is-dragging{cursor:grabbing!important}');
    expect(stylesCss).toContain('.canvas-viewport{width:100%;height:100%');
    expect(stylesCss).toContain('.canvas-controls{position:absolute;top:12px;right:12px;z-index:20');

    // main.tsx integrates PanZoomCanvas around the visualizer
    expect(mainTsx).toContain('<PanZoomCanvas><VisualErrorBoundary key={event?.step ?? 0}><Visual event={event}');
  });

  it('Criteria 3: String visualizer no longer spawns native CSS scrollbars and renders at natural width', () => {
    // Neither styles.css nor motion.css has overflow: auto / overflow-x: auto on string-view or string-cells
    expect(stylesCss).not.toMatch(/\.string-view\s*\{[^}]*overflow(-[xy])?:\s*(auto|scroll)/);
    expect(stylesCss).not.toMatch(/\.string-cells\s*\{[^}]*overflow(-[xy])?:\s*(auto|scroll)/);
    expect(motionCss).not.toMatch(/\.string-view\s*\{[^}]*overflow(-[xy])?:\s*(auto|scroll)/);
    expect(motionCss).not.toMatch(/\.string-cells\s*\{[^}]*overflow(-[xy])?:\s*(auto|scroll)/);

    // Natural width and visible overflow
    expect(stylesCss).toContain('.string-view{display:flex;flex-direction:column;align-items:flex-start;gap:16px;width:max-content;overflow:visible;padding:20px 24px}');
    expect(stylesCss).toContain('.string-cells{display:flex;flex-direction:row;flex-wrap:nowrap;align-items:stretch;gap:6px;width:max-content;overflow:visible}');

    expect(motionCss).toContain('.string-view{display:flex;flex-direction:column;align-items:flex-start;gap:16px;width:max-content;overflow:visible;padding:20px 24px}');
    expect(motionCss).toContain('.string-cells{display:flex;flex-direction:row;flex-wrap:nowrap;align-items:stretch;gap:6px;width:max-content;overflow:visible;padding:8px 4px 12px}');
  });

  it('Criteria 4: Textual return messages like "Pattern matched" no longer render on top of the graphical canvas', () => {
    // StringView does not render string-match-banner inside the graphical visualizer
    expect(mainTsx).not.toContain('<div className="string-match-banner">');

    // matchMessage is routed to the Event Explanation and Source & Operation panels
    expect(mainTsx).toContain('const matchMessage = useMemo(');
    expect(mainTsx).toContain('Pattern matched at index');

    // Route to explain panel
    expect(mainTsx).toContain('<span className="event-chip">{matchMessage ? \'MATCH\'');
    expect(mainTsx).toContain('<b>{matchMessage ? `✓ ${matchMessage}');

    // Route to source & operation panel
    expect(mainTsx).toContain('{matchMessage ? ` · ✓ ${matchMessage}` : \'\'}');
    expect(mainTsx).toContain('{matchMessage && <div className="operation-status-badge" aria-label="Operation status">✓ {matchMessage}</div>}');
  });
});
