import React, { useEffect, useRef, useState } from 'react';
import { Lock, RotateCcw, Unlock, ZoomIn, ZoomOut } from 'lucide-react';

export interface PanZoomCanvasProps {
  children: React.ReactNode;
  className?: string;
  initialScale?: number;
}

export function PanZoomCanvas({ children, className = '', initialScale = 1 }: PanZoomCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(initialScale);
  const [isLocked, setIsLocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Mouse drag panning
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLocked) return;
    if (e.button !== 0) return; // Only primary mouse button

    const target = e.target as HTMLElement;
    if (target.closest('.canvas-controls') || target.closest('button, input, select, textarea, a')) {
      return;
    }

    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || isLocked) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      });
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, isLocked]);

  // Wheel zoom (non-passive to allow preventDefault)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (isLocked) return;
      e.preventDefault();

      const rect = container.getBoundingClientRect();
      const cursorX = e.clientX - rect.left - rect.width / 2;
      const cursorY = e.clientY - rect.top - rect.height / 2;

      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      setScale(prevScale => {
        const nextScale = Math.min(5, Math.max(0.2, prevScale * factor));
        setPan(prevPan => ({
          x: cursorX - (cursorX - prevPan.x) * (nextScale / prevScale),
          y: cursorY - (cursorY - prevPan.y) * (nextScale / prevScale),
        }));
        return nextScale;
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isLocked]);

  // Touch pan & pinch zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartPos = { x: 0, y: 0 };
    let touchStartPan = { x: 0, y: 0 };
    let initialPinchDistance = 0;
    let initialScale = 1;

    const getDistance = (t1: Touch, t2: Touch) => Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

    const handleTouchStart = (e: TouchEvent) => {
      if (isLocked) return;
      if ((e.target as HTMLElement).closest('.canvas-controls')) return;

      if (e.touches.length === 1) {
        touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        touchStartPan = { ...pan };
      } else if (e.touches.length === 2) {
        initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
        initialScale = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isLocked) return;
      if (e.touches.length === 1) {
        e.preventDefault();
        const dx = e.touches[0].clientX - touchStartPos.x;
        const dy = e.touches[0].clientY - touchStartPos.y;
        setPan({ x: touchStartPan.x + dx, y: touchStartPan.y + dy });
      } else if (e.touches.length === 2 && initialPinchDistance > 0) {
        e.preventDefault();
        const dist = getDistance(e.touches[0], e.touches[1]);
        const factor = dist / initialPinchDistance;
        setScale(Math.min(5, Math.max(0.2, initialScale * factor)));
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isLocked, pan, scale]);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) return;
    setScale(prev => {
      const next = Math.min(5, prev * 1.25);
      setPan(p => ({
        x: p.x * (next / prev),
        y: p.y * (next / prev),
      }));
      return next;
    });
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) return;
    setScale(prev => {
      const next = Math.max(0.2, prev / 1.25);
      setPan(p => ({
        x: p.x * (next / prev),
        y: p.y * (next / prev),
      }));
      return next;
    });
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPan({ x: 0, y: 0 });
    setScale(1);
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLocked(prev => !prev);
  };

  return (
    <div
      ref={containerRef}
      className={`canvas ${isLocked ? 'is-locked' : ''} ${isDragging ? 'is-dragging' : ''} ${className}`}
      onMouseDown={handleMouseDown}
      style={{
        cursor: isLocked ? 'default' : isDragging ? 'grabbing' : 'grab',
      }}
    >
      <div className="canvas-controls" aria-label="Canvas pan and zoom controls">
        <button
          type="button"
          className="canvas-btn"
          onClick={handleZoomIn}
          disabled={isLocked}
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn size={15} />
        </button>
        <button
          type="button"
          className="canvas-btn"
          onClick={handleZoomOut}
          disabled={isLocked}
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut size={15} />
        </button>
        <span className="canvas-zoom-badge" aria-label="Current zoom level">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          className="canvas-btn"
          onClick={handleReset}
          title="Reset View"
          aria-label="Reset view"
        >
          <RotateCcw size={15} />
        </button>
        <button
          type="button"
          className={`canvas-btn canvas-lock-btn ${isLocked ? 'is-locked' : ''}`}
          onClick={handleToggleLock}
          title={isLocked ? 'Unlock View' : 'Lock View'}
          aria-label={isLocked ? 'Unlock canvas view' : 'Lock canvas view'}
          aria-pressed={isLocked}
        >
          {isLocked ? <Lock size={15} /> : <Unlock size={15} />}
        </button>
      </div>

      <div
        className="canvas-viewport"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transition: isDragging ? 'none' : 'transform 0.18s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
