import React, { useMemo } from 'react';
import { Activity, Cpu, Database, Gauge, GitCompare, RefreshCw, Zap } from 'lucide-react';
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
          // List object overhead (56 bytes) + 8 bytes per pointer + element sizes
          currentBytes += 56 + v.length * 8;
        } else if (typeof v === 'number') {
          currentBytes += 28; // Python int overhead
        } else if (typeof v === 'string') {
          currentBytes += 49 + v.length; // Python str overhead
        } else if (typeof v === 'object' && v !== null) {
          currentBytes += 128; // Custom object / dict
        }
      });

      if (currentBytes > peakSpaceBytes) {
        peakSpaceBytes = currentBytes;
      }

      // Sample every few steps for responsive sparkline
      if (idx % Math.max(1, Math.floor(events.length / 24)) === 0 || idx === activeEvents.length - 1) {
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

  const maxOps = Math.max(1, telemetry.totalOps);
  const sparklinePoints = useMemo(() => {
    if (!telemetry.sparklineData.length) return '';
    const data = telemetry.sparklineData;
    const width = 120;
    const height = 30;
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
          <Gauge size={13} className="hud-pulse-icon" />
          <span>COMPLEXITY ODOMETER</span>
        </div>
        <span className="odometer-live-tag">LIVE TELEMETRY</span>
      </div>

      <div className="odometer-meters-grid">
        {/* Comparison Counter */}
        <div className="odometer-card">
          <div className="odometer-meta">
            <span className="odometer-label">
              <GitCompare size={12} /> Comparisons
            </span>
            <span className="odometer-sub">`if / == / &lt;`</span>
          </div>
          <div className="odometer-digital-display">
            <span className="odometer-number comparisons-glow">
              {telemetry.comparisonsCount.toLocaleString()}
            </span>
          </div>
          <div className="odometer-bar-track">
            <div
              className="odometer-bar comparisons-bar"
              style={{ width: `${Math.min(100, (telemetry.comparisonsCount / maxOps) * 100)}%` }}
            />
          </div>
        </div>

        {/* Array Swaps / Moves Counter */}
        <div className="odometer-card">
          <div className="odometer-meta">
            <span className="odometer-label">
              <RefreshCw size={12} /> Array Swaps
            </span>
            <span className="odometer-sub">`a[i], a[j] = a[j], a[i]`</span>
          </div>
          <div className="odometer-digital-display">
            <span className="odometer-number swaps-glow">
              {telemetry.arraySwapsCount.toLocaleString()}
            </span>
          </div>
          <div className="odometer-bar-track">
            <div
              className="odometer-bar swaps-bar"
              style={{ width: `${Math.min(100, (telemetry.arraySwapsCount / maxOps) * 100)}%` }}
            />
          </div>
        </div>

        {/* Peak Memory / Auxiliary Space Counter */}
        <div className="odometer-card">
          <div className="odometer-meta">
            <span className="odometer-label">
              <Database size={12} /> Peak Space
            </span>
            <span className="odometer-sub">Heap + Frame Slots</span>
          </div>
          <div className="odometer-digital-display">
            <span className="odometer-number space-glow">
              {telemetry.peakSpaceBytes >= 1024
                ? `${(telemetry.peakSpaceBytes / 1024).toFixed(1)} KB`
                : `${telemetry.peakSpaceBytes} B`}
            </span>
          </div>
          <div className="odometer-bar-track">
            <div
              className="odometer-bar space-bar"
              style={{
                width: `${Math.min(100, (telemetry.peakSpaceBytes / 2048) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Total Cumulative Operations & Telemetry Graph */}
        <div className="odometer-card odometer-chart-card">
          <div className="odometer-meta">
            <span className="odometer-label">
              <Zap size={12} /> Total Operations
            </span>
            <span className="odometer-sub">Cumulative Rate</span>
          </div>
          <div className="odometer-chart-row">
            <span className="odometer-number total-glow">
              {telemetry.totalOps.toLocaleString()}
            </span>
            {telemetry.sparklineData.length > 1 && (
              <svg className="odometer-sparkline" viewBox="0 0 120 30">
                <polyline
                  fill="none"
                  stroke="#c4f34a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sparklinePoints}
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
