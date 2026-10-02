import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Link,
  Unlink,
  RotateCcw,
  Code2,
  Sparkles,
  Layers,
  ArrowRight,
  Move,
  Info,
  Check,
} from 'lucide-react';

export interface SandboxNode {
  id: string;
  value: string | number;
  x: number;
  y: number;
  nextPointer: string | null;
  color?: string;
}

interface SandboxModeProps {
  onLoadIntoWorkspace?: (pythonCode: string) => void;
}

const PRESET_TEMPLATES: Record<string, SandboxNode[]> = {
  'Singly Linked List': [
    { id: 'node-1', value: 10, x: 120, y: 220, nextPointer: 'node-2' },
    { id: 'node-2', value: 20, x: 280, y: 220, nextPointer: 'node-3' },
    { id: 'node-3', value: 30, x: 440, y: 220, nextPointer: 'node-4' },
    { id: 'node-4', value: 40, x: 600, y: 220, nextPointer: null },
  ],
  'Binary Tree (Left/Right Pointers)': [
    { id: 'root', value: 'Root(50)', x: 400, y: 100, nextPointer: 'left-1' },
    { id: 'left-1', value: 'L(25)', x: 260, y: 220, nextPointer: 'left-2' },
    { id: 'right-1', value: 'R(75)', x: 540, y: 220, nextPointer: 'right-2' },
    { id: 'left-2', value: 'LL(12)', x: 180, y: 340, nextPointer: null },
    { id: 'right-2', value: 'RR(90)', x: 620, y: 340, nextPointer: null },
  ],
  'Circular Loop (Cycle Detection)': [
    { id: 'cycle-1', value: 1, x: 250, y: 160, nextPointer: 'cycle-2' },
    { id: 'cycle-2', value: 2, x: 450, y: 160, nextPointer: 'cycle-3' },
    { id: 'cycle-3', value: 3, x: 450, y: 320, nextPointer: 'cycle-4' },
    { id: 'cycle-4', value: 4, x: 250, y: 320, nextPointer: 'cycle-1' },
  ],
};

export function SandboxMode({ onLoadIntoWorkspace }: SandboxModeProps) {
  const [nodes, setNodes] = useState<SandboxNode[]>(() => PRESET_TEMPLATES['Singly Linked List']);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
  const [mode, setMode] = useState<'drag' | 'link' | 'delete'>('drag');
  const [nodeValueInput, setNodeValueInput] = useState<string>('50');
  const [copiedCode, setCopiedCode] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingNodeRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  // SVG coordinate transformation
  const getSvgCoordinates = useCallback((e: React.PointerEvent | PointerEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    const x = Math.round(clientX - rect.left);
    const y = Math.round(clientY - rect.top);
    return { x, y };
  }, []);

  // Pointer Down on a Node
  const handleNodePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    if (mode === 'link') {
      if (!linkingSourceId) {
        setLinkingSourceId(id);
      } else if (linkingSourceId === id) {
        setLinkingSourceId(null);
      } else {
        // Link source -> target
        setNodes((prev) =>
          prev.map((n) => (n.id === linkingSourceId ? { ...n, nextPointer: id } : n))
        );
        setLinkingSourceId(null);
      }
      return;
    }

    if (mode === 'delete') {
      deleteNode(id);
      return;
    }

    // Drag mode
    setSelectedNodeId(id);
    const targetNode = nodes.find((n) => n.id === id);
    if (!targetNode) return;

    const coords = getSvgCoordinates(e);
    draggingNodeRef.current = {
      id,
      offsetX: coords.x - targetNode.x,
      offsetY: coords.y - targetNode.y,
    };

    (e.target as Element).setPointerCapture(e.pointerId);
  };

  // Pointer Move on SVG Canvas
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingNodeRef.current) return;
    const coords = getSvgCoordinates(e);
    const { id, offsetX, offsetY } = draggingNodeRef.current;

    const newX = Math.max(40, Math.min(coords.x - offsetX, 1000));
    const newY = Math.max(40, Math.min(coords.y - offsetY, 560));

    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x: newX, y: newY } : n))
    );
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNodeRef.current) {
      draggingNodeRef.current = null;
    }
  };

  // Add a new Node
  const addNode = () => {
    const newId = `node-${Date.now().toString().slice(-4)}`;
    const newNode: SandboxNode = {
      id: newId,
      value: nodeValueInput || String(Math.floor(Math.random() * 90 + 10)),
      x: 100 + ((nodes.length * 70) % 600),
      y: 120 + ((nodes.length * 50) % 300),
      nextPointer: null,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
  };

  // Delete a Node
  const deleteNode = (id: string) => {
    setNodes((prev) =>
      prev
        .filter((n) => n.id !== id)
        .map((n) => (n.nextPointer === id ? { ...n, nextPointer: null } : n))
    );
    if (selectedNodeId === id) setSelectedNodeId(null);
    if (linkingSourceId === id) setLinkingSourceId(null);
  };

  // Clear All
  const clearCanvas = () => {
    setNodes([]);
    setSelectedNodeId(null);
    setLinkingSourceId(null);
  };

  // Load Template
  const loadTemplate = (name: string) => {
    const tmpl = PRESET_TEMPLATES[name];
    if (tmpl) {
      setNodes(JSON.parse(JSON.stringify(tmpl)));
      setSelectedNodeId(null);
      setLinkingSourceId(null);
    }
  };

  // Generate Python Code from Canvas
  const generatePythonCode = (): string => {
    if (!nodes.length) {
      return '# Sandbox canvas is empty. Add nodes to generate code.\n';
    }

    const lines: string[] = [
      'class Node:',
      '    def __init__(self, value):',
      '        self.value = value',
      '        self.next = None',
      '',
      '# Initialize instantiated nodes from Sandbox canvas',
    ];

    nodes.forEach((n, idx) => {
      const varName = `node_${idx + 1}`;
      const valStr = typeof n.value === 'number' ? n.value : `"${n.value}"`;
      lines.push(`${varName} = Node(${valStr})  # ID: ${n.id} at (${n.x}, ${n.y})`);
    });

    lines.push('', '# Connect next pointer references');
    nodes.forEach((n, idx) => {
      if (n.nextPointer) {
        const targetIdx = nodes.findIndex((cand) => cand.id === n.nextPointer);
        if (targetIdx >= 0) {
          lines.push(`node_${idx + 1}.next = node_${targetIdx + 1}`);
        }
      }
    });

    lines.push(
      '',
      '# Traverse the generated linked structure',
      'head = node_1',
      'current = head',
      'visited_nodes = []',
      'while current and len(visited_nodes) < 20:',
      '    visited_nodes.append(current.value)',
      '    current = current.next',
      'print("Traversal:", visited_nodes)'
    );

    return lines.join('\n');
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatePythonCode());
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="sandbox-workspace" aria-label="Interactive Sandbox Mode">
      {/* Top Toolbar */}
      <div className="sandbox-toolbar">
        <div className="sandbox-toolbar-group">
          <span className="sandbox-badge">
            <Sparkles size={12} /> TACTILE SANDBOX
          </span>
          <div className="sandbox-mode-selector">
            <button
              className={`mode-btn ${mode === 'drag' ? 'active' : ''}`}
              onClick={() => {
                setMode('drag');
                setLinkingSourceId(null);
              }}
              title="Drag nodes around to reposition"
            >
              <Move size={14} /> Move Nodes
            </button>
            <button
              className={`mode-btn ${mode === 'link' ? 'active' : ''}`}
              onClick={() => setMode('link')}
              title="Click source node then target node to link pointers"
            >
              <Link size={14} /> Connect Pointers
            </button>
            <button
              className={`mode-btn delete-mode-btn ${mode === 'delete' ? 'active' : ''}`}
              onClick={() => {
                setMode('delete');
                setLinkingSourceId(null);
              }}
              title="Click a node to remove it"
            >
              <Trash2 size={14} /> Delete Mode
            </button>
          </div>
        </div>

        {/* Add Node Controls */}
        <div className="sandbox-toolbar-group">
          <div className="add-node-bar">
            <input
              type="text"
              placeholder="Value (e.g. 42)"
              value={nodeValueInput}
              onChange={(e) => setNodeValueInput(e.target.value)}
              aria-label="Node value"
            />
            <button className="add-node-btn" onClick={addNode}>
              <Plus size={14} /> Add Node
            </button>
          </div>

          <div className="templates-dropdown">
            <select
              aria-label="Load preset topology"
              onChange={(e) => {
                if (e.target.value) loadTemplate(e.target.value);
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Load Topology Preset...
              </option>
              {Object.keys(PRESET_TEMPLATES).map((tmpl) => (
                <option key={tmpl} value={tmpl}>
                  {tmpl}
                </option>
              ))}
            </select>
          </div>

          <button className="clear-btn" onClick={clearCanvas} title="Clear canvas">
            <RotateCcw size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="sandbox-canvas-wrapper">
        <svg
          ref={svgRef}
          className="sandbox-svg-canvas"
          viewBox="0 0 1080 600"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            <pattern id="sandbox-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#202c3e" />
            </pattern>
            <marker
              id="pointer-arrow"
              markerWidth="10"
              markerHeight="8"
              refX="18"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 10 4, 0 8" fill="#c4f34a" />
            </marker>
            <marker
              id="linking-arrow"
              markerWidth="10"
              markerHeight="8"
              refX="18"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 10 4, 0 8" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#sandbox-grid)" />

          {/* Connecting Arrows */}
          {nodes.map((node) => {
            if (!node.nextPointer) return null;
            const target = nodes.find((cand) => cand.id === node.nextPointer);
            if (!target) return null;

            // Self-referencing loop
            if (target.id === node.id) {
              const loopPath = `M ${node.x} ${node.y - 28} C ${node.x - 40} ${node.y - 70}, ${
                node.x + 40
              } ${node.y - 70}, ${node.x + 20} ${node.y - 28}`;
              return (
                <path
                  key={`self-${node.id}`}
                  d={loopPath}
                  className="sandbox-edge loop-edge"
                  markerEnd="url(#pointer-arrow)"
                />
              );
            }

            // Normal or Curved Arrow
            const dx = target.x - node.x;
            const dy = target.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = 28;

            const startX = node.x + (dx / dist) * radius;
            const startY = node.y + (dy / dist) * radius;
            const endX = target.x - (dx / dist) * radius;
            const endY = target.y - (dy / dist) * radius;

            return (
              <g key={`edge-${node.id}-${target.id}`}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  className="sandbox-edge"
                  markerEnd="url(#pointer-arrow)"
                />
                <text
                  x={(startX + endX) / 2}
                  y={(startY + endY) / 2 - 6}
                  className="sandbox-edge-label"
                >
                  next
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isLinkingSource = linkingSourceId === node.id;

            return (
              <g
                key={node.id}
                className={`sandbox-node-group ${isSelected ? 'is-selected' : ''} ${
                  isLinkingSource ? 'is-linking-source' : ''
                }`}
                onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                style={{ cursor: mode === 'drag' ? 'grab' : 'pointer' }}
              >
                {/* Node Outer Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="28"
                  className="sandbox-node-circle"
                />

                {/* Node Value Label */}
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  className="sandbox-node-text"
                >
                  {String(node.value)}
                </text>

                {/* Coordinates Hint */}
                <text
                  x={node.x}
                  y={node.y + 44}
                  textAnchor="middle"
                  className="sandbox-coords-hint"
                >
                  {node.id} ({node.x}, {node.y})
                </text>

                {/* Next Pointer Anchor Dot */}
                <circle
                  cx={node.x + 22}
                  cy={node.y}
                  r="4"
                  className={`sandbox-anchor-dot ${node.nextPointer ? 'has-pointer' : ''}`}
                >
                  <title>{node.nextPointer ? `next -> ${node.nextPointer}` : 'No next pointer'}</title>
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Live HUD / Code Generator Drawer */}
        <div className="sandbox-hud-bar">
          <div className="sandbox-hud-info">
            <Info size={14} className="hud-icon" />
            <span>
              {mode === 'drag' && 'Mode: Drag nodes freely across the infinite 2D canvas.'}
              {mode === 'link' &&
                (linkingSourceId
                  ? `Select target node to complete pointer from "${linkingSourceId}"...`
                  : 'Click a source node to initiate pointer connection.')}
              {mode === 'delete' && 'Click any node to delete it from the structure.'}
            </span>
          </div>

          <div className="sandbox-hud-actions">
            <button className="hud-btn" onClick={handleCopyCode}>
              {copiedCode ? <Check size={14} /> : <Code2 size={14} />}
              {copiedCode ? 'Copied Python!' : 'Copy Python Code'}
            </button>
            {onLoadIntoWorkspace && (
              <button
                className="hud-btn primary-hud-btn"
                onClick={() => onLoadIntoWorkspace(generatePythonCode())}
              >
                <ArrowRight size={14} /> Load into Visualizer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
