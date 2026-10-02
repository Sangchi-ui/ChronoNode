import React, { useEffect, useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
} from 'lucide-react';
import { tracePython, type TraceEvent } from './trace';
import { PanZoomCanvas } from './PanZoomCanvas';
import { ComplexityOdometer } from './ComplexityOdometer';
import {
  AuxiliaryStructures,
  pretty,
  Visual,
  VisualErrorBoundary,
} from './VisualizerCore';

interface EmbeddedVisualizerProps {
  initialCode: string;
  title?: string;
}

export function EmbeddedVisualizer({ initialCode, title: _title }: EmbeddedVisualizerProps) {
  const [code, setCode] = useState(initialCode);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(450);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(true);
  const [showStates, setShowStates] = useState(false);

  const codeEditor = useRef<any>(null);
  const decorations = useRef<string[]>([]);

  // Execute trace and optionally start playing immediately
  const runTrace = async (autoPlay: boolean = false): Promise<TraceEvent[]> => {
    setRunning(false);
    setLoading(true);
    setError('');
    try {
      const result = await tracePython(code);
      setEvents(result);
      setIndex(0);
      if (autoPlay && result.length > 1) {
        setRunning(true);
      }
      return result;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Preload and trace whenever initialCode updates (e.g. switching algorithms)
  useEffect(() => {
    setCode(initialCode);
    setEvents([]);
    setIndex(0);
    setRunning(false);
    setError('');

    let isMounted = true;
    setLoading(true);
    tracePython(initialCode)
      .then((res) => {
        if (isMounted) {
          setEvents(res);
          setIndex(0);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialCode]);

  const event = events[index];
  const variables = event?.variables || {};

  const beforeText = useMemo(
    () => (event?.beforeState ? JSON.stringify(event.beforeState, null, 2) : ''),
    [event]
  );
  const afterText = useMemo(
    () => (event?.afterState ? JSON.stringify(event.afterState, null, 2) : ''),
    [event]
  );

  // Playback timer driven by state transitions
  useEffect(() => {
    if (!running || events.length < 1) return;
    const timer = window.setTimeout(() => {
      if (index >= events.length - 1) {
        setRunning(false);
      } else {
        const nextIndex = index + 1;
        if (events[nextIndex]?.eventType === 'error') {
          setRunning(false);
        }
        setIndex(nextIndex);
      }
    }, speed);
    return () => window.clearTimeout(timer);
  }, [running, index, events, speed]);

  useEffect(() => {
    if (event?.eventType === 'error' && running) {
      setRunning(false);
    }
  }, [event?.eventType, running]);

  // Code editor line highlighting
  useEffect(() => {
    const editor = codeEditor.current;
    if (!editor || !event?.line) return;
    decorations.current = editor.deltaDecorations(decorations.current, [
      {
        range: new (window as any).monaco.Range(event.line, 1, event.line, 1),
        options: {
          isWholeLine: true,
          className: 'current-code-line',
          linesDecorationsClassName: 'code-line-marker',
        },
      },
    ]);
    editor.revealLineInCenterIfOutsideViewport(event.line);
  }, [event?.line]);

  const handlePlayToggle = async () => {
    if (events.length > 0) {
      setRunning((prev) => !prev);
    } else {
      await runTrace(true);
    }
  };

  const progress =
    events.length > 1 ? (index / (events.length - 1)) * 100 : events.length ? 100 : 0;

  const matchMessage = useMemo(() => {
    if (!event) return null;
    const currentState = (event.afterState || event.state || {}) as Record<string, unknown>;
    const foundAt =
      typeof event.variables?.found_at === 'number'
        ? (event.variables.found_at as number)
        : typeof event.variables?.found === 'number'
        ? (event.variables.found as number)
        : typeof event.variables?.result === 'number' && event.variables.result >= 0
        ? (event.variables.result as number)
        : undefined;
    const comparing = event.eventType === 'compare' || event.operation === 'compare';
    const isBranchTaken = event.focus?.result === 'taken';
    const pointerNames = ['index', 'idx', 'i', 'j', 'start', 'left', 'right', 'position'];
    const pointerEntry = Object.entries(event.variables || {}).find(
      ([k, v]) => pointerNames.includes(k) && typeof v === 'number'
    );
    const pointerIndex = pointerEntry
      ? (pointerEntry[1] as number)
      : typeof currentState.index === 'number'
      ? (currentState.index as number)
      : undefined;
    const isMatchFound =
      foundAt !== undefined ||
      (comparing && isBranchTaken && event.structure === 'string') ||
      event.variables?.is_palindrome === true;
    const matchStart =
      foundAt !== undefined
        ? foundAt
        : isMatchFound && pointerIndex !== undefined
        ? pointerIndex
        : event.focus?.indices?.[0] ?? -1;
    if (isMatchFound && matchStart >= 0) {
      return `Pattern matched at index ${matchStart}`;
    }
    return null;
  }, [event]);

  return (
    <div className="workspace embedded-workspace w-full">
      {/* Standardized Toolbar aligned with Code Editor (40%) and Canvas (60%) */}
      <div className="toolbar">
        <div className="toolbar-editor-section">
          <button
            className="reset-code-btn"
            onClick={() => {
              setCode(initialCode);
              setEvents([]);
              setIndex(0);
              setRunning(false);
              runTrace(false);
            }}
            title="Reset code to original"
          >
            <RotateCcw size={14} />
            <span>Reset Code</span>
          </button>

          <div className="run-controls">
            <button
              disabled={!events.length}
              onClick={() => {
                setRunning(false);
                setIndex(0);
              }}
              title="Restart replay"
              aria-label="Restart replay"
            >
              <RotateCcw size={16} />
            </button>
            <button
              disabled={!events.length || index === 0}
              onClick={() => {
                setRunning(false);
                setIndex((i) => Math.max(0, i - 1));
              }}
              title="Previous step"
              aria-label="Previous step"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="run"
              disabled={loading}
              onClick={handlePlayToggle}
              aria-label={events.length ? (running ? 'Pause' : 'Resume') : 'Run code'}
            >
              {loading ? (
                <span className="spinner" />
              ) : running ? (
                <Pause size={15} />
              ) : (
                <Play size={15} />
              )}{' '}
              {loading ? 'Tracing…' : events.length ? (running ? 'Pause' : 'Resume') : 'Run code'}
            </button>
            <button
              disabled={!events.length || index >= events.length - 1}
              onClick={() => {
                setRunning(false);
                setIndex((i) => Math.min(events.length - 1, i + 1));
              }}
              title="Next step"
              aria-label="Next step"
            >
              <ChevronRight size={18} />
            </button>
            <button
              disabled={!events.length || index >= events.length - 1}
              onClick={() => {
                setRunning(false);
                setIndex(events.length - 1);
              }}
              title="Jump to last step"
              aria-label="Jump to last step"
            >
              <SkipForward size={16} />
            </button>
          </div>
        </div>

        <div className="toolbar-visual-section">
          <label className="speed-control">
            Speed{' '}
            <input
              aria-label="Playback speed"
              type="range"
              min="80"
              max="1200"
              step="40"
              value={1200 - speed}
              onChange={(e) => setSpeed(1200 - Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* Balanced 40/60 Split Panes with Minimum Width for Code Readability */}
      <div className="panes embedded-panes embedded-split-workspace">
        {/* Left Side: Code Editor (40% width, min 460px) */}
        <div className="editor-pane embedded-code-pane">
          <div className="pane-head">
            <span>algorithm.py</span>
            <span className="python">PYTHON</span>
          </div>
          <Editor
            height="100%"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => {
              setCode(value || '');
              setEvents([]);
              setIndex(0);
              setRunning(false);
            }}
            onMount={(editor) => {
              codeEditor.current = editor;
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              glyphMargin: true,
              ariaLabel: 'Python source code editor',
            }}
          />
        </div>

        {/* Right Side: Visualizer Canvas */}
        <div className="visual-pane embedded-visual-pane">
          <div className="visual-head">
            <div>
              <span className="eyebrow">EXECUTION VISUALIZATION</span>
              <h2>{event?.structure || 'Ready to trace'}</h2>
            </div>
            <span className="step">
              {events.length ? `Step ${index + 1} / ${events.length}` : 'Click Run code to trace'}
            </span>
          </div>

          <div className="visual-canvas-container canvas">
            <PanZoomCanvas>
              <VisualErrorBoundary key={event?.step ?? 0}>
                <Visual event={event} animate={animate} source={code} />
              </VisualErrorBoundary>
            </PanZoomCanvas>
            <ComplexityOdometer events={events} currentIndex={index} />
          </div>

          {/* Centered Node Legend below Canvas matching main Editor */}
          <div className="legend" aria-label="Visualization legend">
            <span>
              <i className="legend-compare" />
              Comparison
            </span>
            <span>
              <i className="legend-change" />
              Changed value
            </span>
            <span>
              <i className="legend-pointer" />
              Current pointer
            </span>
          </div>

          {/* Timeline Scrubber */}
          <div className="timeline" aria-label="Execution timeline">
            <div className="progress" style={{ width: `${progress}%` }} />
            <input
              aria-label="Jump to execution step"
              className="timeline-range"
              type="range"
              min="0"
              max={Math.max(0, events.length - 1)}
              value={index}
              disabled={!events.length}
              onChange={(e) => {
                setRunning(false);
                setIndex(Number(e.target.value));
              }}
            />
            <div className="timeline-labels">
              <span>
                {events.length ? `#${index + 1} · line ${event?.line || '—'}` : 'Run to create steps'}
              </span>
              <span>
                {events.length ? `${events.length} events` : '← → keys step · Space plays'}
              </span>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="explain">
            <span className="event-chip">{matchMessage ? 'MATCH' : event?.eventType || 'READY'}</span>
            <div className="event-description">
              <b>
                {matchMessage
                  ? `✓ ${matchMessage} · ${event?.explanation || ''}`
                  : event?.explanation || 'Run your Python code to record its actual operations'}
              </b>
              <small>{event?.statement || 'The source line and exact state will appear here.'}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width 3-Column Bottom Panel matching main Editor */}
      <div className="bottom">
        <AuxiliaryStructures event={event} source={code} />

        {/* 1. Variables */}
        <section className="bottom-section">
          <div className="section-heading">
            <span className="eyebrow">VARIABLES · {event?.function || '—'}()</span>
            {event && <span className="depth-pill">depth {event.depth}</span>}
          </div>
          {Object.keys(variables).length ? (
            <div className="vars">
              {Object.entries(variables).map(([key, value]) => (
                <div className="var" key={key}>
                  <code>{key}</code>
                  <span title={pretty(value)}>{pretty(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Variables at this execution point will appear here.</p>
          )}
        </section>

        {/* 2. Call Stack */}
        <section className="bottom-section call-stack-section">
          <span className="eyebrow">CALL STACK</span>
          {event?.callStack && event.callStack.length ? (
            <div className="call-stack">
              {event.callStack.map((frame, i) => (
                <div
                  className={`call-frame ${i === event.callStack.length - 1 ? 'active-frame' : ''}`}
                  key={`${frame.name}-${i}`}
                >
                  <b>{frame.name}()</b>
                  <span>line {frame.line}</span>
                  <small>
                    {Object.entries(frame.arguments)
                      .map(([k, v]) => `${k}=${pretty(v)}`)
                      .join(', ')}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No active function calls at this step.</p>
          )}
        </section>

        {/* 3. Source & Operation */}
        <section className="bottom-section event-meta">
          <span className="eyebrow">SOURCE & OPERATION</span>
          <p className="source-statement">
            <code>{event?.line ? `${event.line}: ` : ''}{event?.statement || 'Waiting for execution'}</code>
          </p>
          <p className="muted">
            {event?.operation || '—'}
            {event?.returnValue !== undefined ? ` · returns ${pretty(event.returnValue)}` : ''}
            {event?.focus?.result ? ` · branch ${event.focus.result}` : ''}
            {matchMessage ? ` · ✓ ${matchMessage}` : ''}
          </p>
          {matchMessage && (
            <div className="operation-status-badge" aria-label="Operation status">
              ✓ {matchMessage}
            </div>
          )}
          {event?.lineComplexity && (
            <div className="line-complexity" aria-label="Time and space cost for this step">
              <span>
                Time{' '}
                <b>
                  {event.lineComplexity.time &&
                  event.lineComplexity.time !== 'O(?)' &&
                  event.lineComplexity.time !== '?'
                    ? event.lineComplexity.time
                    : 'O(1)'}
                </b>{' '}
                ·{' '}
                {event.lineComplexity.timeDetails &&
                !event.lineComplexity.timeDetails.includes('not covered') &&
                !event.lineComplexity.timeDetails.includes('O(?)')
                  ? event.lineComplexity.timeDetails
                  : 'Scalar operation'}
              </span>
              <br />
              <span>
                Space{' '}
                <b>
                  {event.lineComplexity.space &&
                  event.lineComplexity.space !== 'O(?)' &&
                  event.lineComplexity.space !== '?'
                    ? event.lineComplexity.space
                    : 'O(1)'}
                </b>{' '}
                ·{' '}
                {event.lineComplexity.spaceDetails &&
                !event.lineComplexity.spaceDetails.includes('not covered') &&
                !event.lineComplexity.spaceDetails.includes('O(?)')
                  ? event.lineComplexity.spaceDetails
                  : 'No additional auxiliary elements'}
              </span>
            </div>
          )}
          {event?.output && <pre className="event-output">{event.output}</pre>}
          <label className="toggle">
            <input
              type="checkbox"
              checked={animate}
              onChange={(e) => setAnimate(e.target.checked)}
            />{' '}
            Animate changed values
          </label>
          <button className="states-toggle" onClick={() => setShowStates((open) => !open)}>
            {showStates ? 'Hide' : 'Inspect'} before / after state
          </button>
        </section>
      </div>

      {/* State Inspection Drawer */}
      {showStates && event && (
        <div className="state-comparison">
          <div>
            <span className="eyebrow">BEFORE THIS EVENT</span>
            <pre>{beforeText}</pre>
          </div>
          <div>
            <span className="eyebrow">AFTER THIS EVENT</span>
            <pre>{afterText}</pre>
          </div>
        </div>
      )}

      {error && (
        <div className="toast error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
    </div>
  );
}
