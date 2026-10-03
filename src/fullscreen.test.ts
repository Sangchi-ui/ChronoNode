import { beforeAll, describe, expect, it } from 'vitest';

let embeddedVisualizerTsx = '';
let mainTsx = '';
let algorithmsCss = '';

beforeAll(async () => {
  // @ts-ignore
  const fs = await import('node:fs');
  embeddedVisualizerTsx = fs.readFileSync(new URL('./EmbeddedVisualizer.tsx', import.meta.url), 'utf-8');
  mainTsx = fs.readFileSync(new URL('./main.tsx', import.meta.url), 'utf-8');
  algorithmsCss = fs.readFileSync(new URL('./algorithms.css', import.meta.url), 'utf-8');
});

describe('ChronoNode Visualizer Full-Screen Mode', () => {
  describe('1. Target Container (DOM Refactor)', () => {
    it('applies the fullscreen state to the parent wrapper rather than just the inner canvas', () => {
      // Fullscreen wrapper wraps canvas, toolbar, timeline, and telemetry
      expect(embeddedVisualizerTsx).toContain('ref={visualizerRef}');
      expect(embeddedVisualizerTsx).toContain('data-testid="visualizer-fullscreen-wrapper"');
      expect(embeddedVisualizerTsx).toContain('is-fullscreen');
      expect(mainTsx).toContain('ref={visualizerRef}');
      expect(mainTsx).toContain('data-testid="visualizer-fullscreen-wrapper"');
    });

    it('ensures the Telemetry/Odometer card is a child of the fullscreen wrapper', () => {
      // Telemetry card resides inside visual-canvas-container, inside visualizer-fullscreen-wrapper
      expect(embeddedVisualizerTsx).toMatch(/data-testid="visualizer-fullscreen-wrapper"[\s\S]*?<ComplexityOdometer/);
      expect(mainTsx).toMatch(/data-testid="visualizer-fullscreen-wrapper"[\s\S]*?<ComplexityOdometer/);
    });

    it('ensures the top toolbar (Zoom, Lock, Play, Step) and timeline slider are preserved inside the wrapper', () => {
      // Top internal toolbar inside fullscreen wrapper
      expect(embeddedVisualizerTsx).toMatch(/data-testid="visualizer-fullscreen-wrapper"[\s\S]*?data-testid="visualizer-internal-toolbar"/);
      // PanZoomCanvas provides Zoom and Lock inside the wrapper
      expect(embeddedVisualizerTsx).toMatch(/data-testid="visualizer-fullscreen-wrapper"[\s\S]*?<PanZoomCanvas>/);
      // Timeline slider is inside the wrapper
      expect(embeddedVisualizerTsx).toMatch(/data-testid="visualizer-fullscreen-wrapper"[\s\S]*?className="timeline"/);
      expect(embeddedVisualizerTsx).toMatch(/data-testid="visualizer-fullscreen-wrapper"[\s\S]*?className="timeline-range"/);
    });
  });

  describe('2. Fullscreen API & State Management', () => {
    it('uses HTML5 requestFullscreen on the designated wrapper via a React useRef', () => {
      expect(embeddedVisualizerTsx).toContain('visualizerRef.current.requestFullscreen()');
      expect(embeddedVisualizerTsx).toContain('const visualizerRef = useRef<HTMLDivElement>(null)');
      expect(mainTsx).toContain('visualizerRef.current.requestFullscreen()');
    });

    it('maintains isFullscreen React state listening to native fullscreenchange events', () => {
      expect(embeddedVisualizerTsx).toContain('const [isFullscreen, setIsFullscreen] = useState(false)');
      expect(embeddedVisualizerTsx).toContain("document.addEventListener('fullscreenchange', handleFullscreenChange)");
      expect(embeddedVisualizerTsx).toContain("document.removeEventListener('fullscreenchange', handleFullscreenChange)");
      expect(mainTsx).toContain('const [isFullscreen, setIsFullscreen] = useState(false)');
      expect(mainTsx).toContain("document.addEventListener('fullscreenchange', handleFullscreenChange)");
    });

    it('synchronizes ESC key exits automatically by inspecting document.fullscreenElement', () => {
      // Prevents UI desync when user presses physical ESC key
      expect(embeddedVisualizerTsx).toContain('document.fullscreenElement === visualizerRef.current');
      expect(mainTsx).toContain('document.fullscreenElement === visualizerRef.current');
    });

    it('invokes document.exitFullscreen when exiting', () => {
      expect(embeddedVisualizerTsx).toContain('document.exitFullscreen()');
      expect(mainTsx).toContain('document.exitFullscreen()');
    });
  });

  describe('3. UI Toggle Buttons', () => {
    it('adds a Full Screen toggle button to the top right of the visualizer internal toolbar', () => {
      expect(embeddedVisualizerTsx).toContain('data-testid="fullscreen-toggle-btn"');
      expect(embeddedVisualizerTsx).toContain('visual-head-actions');
      expect(mainTsx).toContain('data-testid="fullscreen-toggle-btn"');
    });

    it('dynamically swaps between Maximize2 and Minimize2 icons based on isFullscreen state', () => {
      expect(embeddedVisualizerTsx).toContain('{isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}');
      expect(embeddedVisualizerTsx).toContain("{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}");
      expect(mainTsx).toContain('{isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}');
    });

    it('renders a dedicated visual "Exit / ESC" button clearly visible in full-screen mode', () => {
      expect(embeddedVisualizerTsx).toContain('data-testid="exit-esc-btn"');
      expect(embeddedVisualizerTsx).toContain('<kbd className="esc-badge">ESC</kbd>');
      expect(embeddedVisualizerTsx).toContain('<span>Exit</span>');
      expect(mainTsx).toContain('data-testid="exit-esc-btn"');
      expect(mainTsx).toContain('<kbd className="esc-badge">ESC</kbd>');
    });
  });

  describe('4. Styling & Layout Adjustments in Full-Screen', () => {
    it('applies strict bg-slate-950 (#020617) to prevent transparency over hidden DOM elements', () => {
      expect(embeddedVisualizerTsx).toContain('bg-slate-950');
      expect(mainTsx).toContain('bg-slate-950');
      expect(algorithmsCss).toMatch(/\.visual-pane\.is-fullscreen[^}]*background-color:\s*#020617\s*!important/);
      expect(algorithmsCss).toMatch(/\.embedded-visual-pane\.is-fullscreen[^}]*background-color:\s*#020617\s*!important/);
    });

    it('expands the inner canvas dynamically to consume massive screen real estate', () => {
      expect(algorithmsCss).toMatch(/\.visual-pane\.is-fullscreen\s+\.visual-canvas-container[^}]*flex:\s*1\s+1\s+auto\s*!important/);
      expect(algorithmsCss).toMatch(/\.visual-pane\.is-fullscreen\s+\.visual-canvas-container[^}]*min-height:\s*58vh\s*!important/);
      expect(algorithmsCss).toMatch(/\.visual-pane\.is-fullscreen\s+\.visual-canvas-container[^}]*height:\s*100%\s*!important/);
      expect(algorithmsCss).toMatch(/\.visual-pane\.is-fullscreen\s+\.visual-canvas-container[^}]*width:\s*100%\s*!important/);
    });

    it('stretches the timeline slider across the full width of the monitor', () => {
      expect(algorithmsCss).toMatch(/\.visual-pane\.is-fullscreen\s+\.timeline[^}]*width:\s*100%\s*!important/);
      expect(algorithmsCss).toMatch(/\.visual-pane\.is-fullscreen\s+\.timeline\s+\.timeline-range[^}]*width:\s*100%\s*!important/);
    });

    it('provides styled button classes for fullscreen toggle and ESC key badge', () => {
      expect(algorithmsCss).toContain('.fullscreen-toggle-btn');
      expect(algorithmsCss).toContain('.exit-esc-btn');
      expect(algorithmsCss).toContain('.esc-badge');
    });
  });

  describe('5. Playback & Classroom Lecture Usability in Full-Screen', () => {
    it('provides an internal playback bar with Play, Pause, Steps, and Speed controls in full-screen', () => {
      expect(embeddedVisualizerTsx).toContain('data-testid="fullscreen-playback-bar"');
      expect(embeddedVisualizerTsx).toMatch(/fullscreen-playback-bar[\s\S]*?aria-label="Restart replay"/);
      expect(embeddedVisualizerTsx).toMatch(/fullscreen-playback-bar[\s\S]*?aria-label="Previous step"/);
      expect(embeddedVisualizerTsx).toMatch(/fullscreen-playback-bar[\s\S]*?aria-label="Next step"/);
      expect(embeddedVisualizerTsx).toMatch(/fullscreen-playback-bar[\s\S]*?aria-label="Jump to last step"/);
      expect(embeddedVisualizerTsx).toMatch(/fullscreen-playback-bar[\s\S]*?aria-label="Playback speed"/);
    });
  });
});
