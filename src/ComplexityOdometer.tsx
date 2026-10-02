import React, { useMemo } from 'react';
import { Database, Gauge, GitCompare, RefreshCw, Zap } from 'lucide-react';
import type { TraceEvent } from './trace';

interface ComplexityOdometerProps {
  events: TraceEvent[];
  currentIndex: number;
}

export function ComplexityOdometer({ events, currentIndex }: ComplexityOdometerProps) {
  // Telemetry computation entirely in browser memory
  const telemetry = useMemo(() => {
    let comparisonsCount = 0;
    let arraySwapsCount = 0;
    let writesCount = 0;
    let peakSpaceBytes = 64; // baseline frame overhead
    const sparklineData: number[] = [];

    const activeEvents = events.slice(0, currentIndex + 1);

    activeEvents.forEach((ev, idx) => {
      const op = ev.operation?.toLowerCase() || '';
      const type = ev.eventType?.toLowerCase() || '';

      // Comparisons increment
      if (op === 'compare' || type === 'compare' || (ev.focus?.values && ev.focus.values.length >= 2)) {
        comparisonsCount++;
      }

      // Swaps increment
      if (op === 'swap' || op === 'move') {
        arraySwapsCount++;
      }

      // Writes / mutations
      if (op === 'write' || op === 'set' || op === 'append' || op === 'push') {
        writesCount++;
      }

      // Memory footprint estimation (CPython 64-bit architecture approximation)
      const state = ev.afterState || ev.state || {};
      let currentBytes = 64; // frame base

      // Call stack memory
      if (ev.callStack) {
        currentBytes += ev.callStack.length * 128;
      }

      // Variables and heap arrays
      Object.entries(state).forEach(([k, v]) => {
        if (k.startsWith('__')) return;
        if (Array.isArray(v)) {
          currentBytes += 56 + v.length * 8;
        } else if (typeof v === 'number') {
          currentBytes += 28;
        } else if (typeof v === 'string') {
          currentBytes += 49 + v.length;
        } else if (typeof v === 'object' && v !== null) {
          currentBytes += 128;
        }
      });

      if (currentBytes > peakSpaceBytes) {
        peakSpaceBytes = currentBytes;
      }

      // Sample every few steps for responsive sparkline
      if (idx % Math.max(1, Math.floor(events.length / 20)) === 0 || idx === activeEvents.length - 1) {
        sparklineData.push(comparisonsCount + arraySwapsCount + writesCount);
      }
    });

    const totalOps = comparisonsCount + arraySwapsCount + writesCount;

    return {
      comparisonsCount,
      arraySwapsCount,
      writesCount,
      totalOps,
      peakSpaceBytes,
      sparklineData,
    };
  }, [events, currentIndex]);

  const sparklinePoints = useMemo(() => {
    if (!telemetry.sparklineData.length) return '';
    const data = telemetry.sparklineData;
    const width = 196;
    const height = 18;
    const maxVal = Math.max(...data, 1);
    return data
      .map((val, i) => {
        const x = (i / Math.max(data.length - 1, 1)) * width;
        const y = height - (val / maxVal) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [telemetry.sparklineData]);

  return (
    <div className="complexity-odometer-hud" aria-label="Complexity Telemetry Odometer">
      <div className="odometer-header">
        <div className="odometer-title">
          <Gauge size={12} className="hud-pulse-icon" />
          <span>TELEMETRY</span>
        </div>
        <div className="odometer-live-tag">
          <span className="live-dot" />
          <span>LIVE</span>
        </div>
      </div>

      <div className="odometer-rows">
        <div className="odometer-row">
          <span className="odometer-label">
            <GitCompare size={11} className="label-icon comparisons-icon" /> Comparisons
          </span>
          <span className="odometer-val comparisons-glow">
            {telemetry.comparisonsCount.toLocaleString()}
          </span>
        </div>

        <div className="odometer-row">
          <span className="odometer-label">
            <RefreshCw size={11} className="label-icon swaps-icon" /> Swaps
          </span>
          <span className="odometer-val swaps-glow">
            {telemetry.arraySwapsCount.toLocaleString()}
          </span>
        </div>

        <div className="odometer-row">
          <span className="odometer-label">
            <Database size={11} className="label-icon space-icon" /> Peak Space
          </span>
          <span className="odometer-val space-glow">
            {telemetry.peakSpaceBytes >= 1024
              ? `${(telemetry.peakSpaceBytes / 1024).toFixed(1)} KB`
              : `${telemetry.peakSpaceBytes} B`}
          </span>
        </div>

        <div className="odometer-row odometer-total-row">
          <span className="odometer-label">
            <Zap size={11} className="label-icon total-icon" /> Operations
          </span>
          <span className="odometer-val total-glow">
            {telemetry.totalOps.toLocaleString()}
          </span>
        </div>
      </div>

      {telemetry.sparklineData.length > 1 && (
        <div className="odometer-sparkline-wrap" title={`Operation Velocity (${telemetry.totalOps} ops total)`}>
          <svg className="odometer-sparkline" viewBox="0 0 196 18">
            <polyline
              fill="none"
              stroke="#c4f34a"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparklinePoints}
            />
          </svg>
        </div>
      )}
    </div>
  );
}
