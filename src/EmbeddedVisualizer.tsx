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

export function EmbeddedVisualizer({ initialCode, title }: EmbeddedVisualizerProps) {
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

  // Update code when initialCode changes (e.g. switching algorithms)
  useEffect(() => {
    setCode(initialCode);
    setEvents([]);
    setIndex(0);
    setRunning(false);
    setError('');
  }, [initialCode]);

  const event = events[index];
  const variables = event?.variables || {};

  // Playback timer
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

  const runTrace = async () => {
    setRunning(false);
    setLoading(true);
    setError('');
    try {
      const result = await tracePython(code);
      setEvents(result);
      setIndex(0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  };

  const progress =
    events.length > 1 ? (index / (events.length - 1)) * 100 : events.length ? 100 : 0;
  const beforeText = useMemo(
    () => (event ? JSON.stringify(event.beforeState, null, 2) : ''),
    [event]
  );
  const afterText = useMemo(
    () => (event ? JSON.stringify(event.afterState, null, 2) : ''),
    [event]
  );

  const matchMessage = useMemo(() => {
    if (!event) return null;
    const currentState = (event.afterState || event.state || {}) as Record<string, unknown>;
    const foundAt =
      typeof event.variables?.found_at === 'number'
        ? (event.variables.found_at as number)
        : typeof event.variables?.found === 'number'
        ? (event.variables.found as number)
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
    <div className="embedded-visualizer-container">
      <div className="embedded-visualizer-header">
        <div className="embedded-title-group">
          <span className="embedded-badge">LIVE PLAYGROUND</span>
          <h3>{title || 'Interactive Execution Visualizer'}</h3>
        </div>
        <div className="embedded-header-actions">
          <button
            className="embedded-run-btn"
            disabled={loading}
            onClick={() => (events.length ? setRunning((val) => !val) : runTrace())}
          >
            {loading ? (
              <span className="spinner" />
            ) : running ? (
              <Pause size={14} />
            ) : (
              <Play size={14} />
            )}
            {loading ? 'Tracing…' : events.length ? (running ? 'Pause' : 'Play Trace') : 'Run Code'}
          </button>
          <button
            className="embedded-reset-btn"
            onClick={() => {
              setCode(initialCode);
              setEvents([]);
              setIndex(0);
              setRunning(false);
            }}
            title="Reset code to original"
          >
            Reset Code
          </button>
        </div>
      </div>

      <div className="embedded-split-workspace">
        {/* LEFT SIDE: Code Editor */}
        <div className="embedded-code-pane">
          <div className="embedded-pane-header">
            <span className="file-name">algorithm.py</span>
            <span className="python-badge">PYTHON 3</span>
          </div>
          <div className="embedded-editor-wrapper">
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
                fontSize: 13,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                glyphMargin: true,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
              }}
            />
          </div>
        </div>

        {/* RIGHT SIDE: Visualizer & Playback */}
        <div className="embedded-visual-pane">
          <div className="embedded-visual-controls">
            <div className="embedded-step-readout">
              <span className="structure-tag">{event?.structure || 'Ready to trace'}</span>
              <span className="step-counter">
                {events.length ? `Step ${index + 1} / ${events.length}` : 'Click "Run Code" to trace'}
              </span>
            </div>
            <div className="embedded-playback-bar">
              <button
                disabled={!events.length}
                onClick={() => {
                  setRunning(false);
                  setIndex(0);
                }}
                title="Restart"
              >
                <RotateCcw size={14} />
              </button>
              <button
                disabled={!events.length || index === 0}
                onClick={() => {
                  setRunning(false);
                  setIndex((i) => Math.max(0, i - 1));
                }}
                title="Previous step"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="play-step-btn"
                disabled={!events.length}
                onClick={() => setRunning((r) => !r)}
              >
                {running ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button
                disabled={!events.length || index >= events.length - 1}
                onClick={() => {
                  setRunning(false);
                  setIndex((i) => Math.min(events.length - 1, i + 1));
                }}
                title="Next step"
              >
                <ChevronRight size={16} />
              </button>
              <button
                disabled={!events.length || index >= events.length - 1}
                onClick={() => {
                  setRunning(false);
                  setIndex(events.length - 1);
                }}
                title="Jump to end"
              >
                <SkipForward size={14} />
              </button>
              <label className="embedded-speed">
                Speed
                <input
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

          <div className="embedded-canvas-wrap">
            <PanZoomCanvas>
              <VisualErrorBoundary key={event?.step ?? 0}>
                <Visual event={event} animate={animate} source={code} />
              </VisualErrorBoundary>
            </PanZoomCanvas>
            <div className="legend">
              <span>
                <i className="legend-compare" /> Comparison
              </span>
              <span>
                <i className="legend-change" /> Changed value
              </span>
              <span>
                <i className="legend-pointer" /> Current pointer
              </span>
            </div>
          </div>

          {/* Scrubber timeline */}
          <div className="embedded-timeline">
            <div className="progress" style={{ width: `${progress}%` }} />
            <input
              aria-label="Execution step"
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
          </div>

          {/* Explanation chip */}
          <div className="explain">
            <span className="event-chip">{matchMessage ? 'MATCH' : event?.eventType || 'READY'}</span>
            <div className="event-description">
              <b>
                {matchMessage
                  ? `✓ ${matchMessage} · ${event?.explanation || ''}`
                  : event?.explanation || 'Run the Python code to inspect step-by-step state changes.'}
              </b>
              <small>{event?.statement || 'Active line and operation details appear here.'}</small>
            </div>
          </div>

          {/* Live Variables & Call Stack */}
          <div className="embedded-state-bar">
            <div className="embedded-section">
              <span className="eyebrow">VARIABLES · {event?.function || 'main'}()</span>
              {Object.keys(variables).length ? (
                <div className="vars">
                  {Object.entries(variables).map(([k, v]) => (
                    <div className="var" key={k}>
                      <code>{k}</code>
                      <span title={pretty(v)}>{pretty(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">Variables at this step will display here.</p>
              )}
            </div>

            <AuxiliaryStructures event={event} source={code} />
          </div>
        </div>
      </div>

      {error && (
        <div className="toast error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
    </div>
  );
}
