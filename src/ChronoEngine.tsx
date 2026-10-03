import React from 'react';
import type { SortingStep, SortingActionType } from './sorting/sortingGenerators';

export type VisualMode = 'SORTING_BARS' | 'ARRAY_CELLS';

export interface ChronoEngineProps {
  mode?: VisualMode;
  step?: SortingStep;
  array?: number[];
  activeIndices?: number[];
  actionType?: SortingActionType;
  sortedIndices?: number[];
  maxValue?: number;
  height?: number | string;
  showValues?: boolean;
  showIndices?: boolean;
}

/**
 * ChronoEngine: Visual rendering engine for algorithm execution.
 * Specifically handles SORTING_BARS mode with neon-green active highlights
 * and locked sorted-boundary indicators for live classroom teaching.
 */
export function ChronoEngine({
  mode = 'SORTING_BARS',
  step,
  array: propArray,
  activeIndices: propActiveIndices,
  actionType: propActionType,
  sortedIndices: propSortedIndices,
  maxValue: propMax,
  height = 320,
  showValues = true,
  showIndices = true,
}: ChronoEngineProps) {
  // Extract values from step if provided, or fallback to direct props
  const array = step ? step.array : (propArray || []);
  const activeIndices = new Set(step ? step.indices : (propActiveIndices || []));
  const actionType = step ? step.type : (propActionType || 'COMPARE');
  const sortedIndices = new Set(step ? step.sortedIndices : (propSortedIndices || []));

  const maxVal = propMax ?? Math.max(...array, 1);
  const minVal = Math.min(...array, 0);
  const range = Math.max(maxVal - minVal, 1);

  if (mode === 'ARRAY_CELLS') {
    return (
      <div className="chrono-engine array-cells-container" data-testid="chrono-engine-cells">
        {array.map((val, idx) => {
          const isActive = activeIndices.has(idx);
          const isSorted = sortedIndices.has(idx);
          return (
            <div
              key={idx}
              data-testid={`cell-${idx}`}
              data-value={val}
              data-active={isActive}
              data-sorted={isSorted}
              className={`array-cell ${
                isActive ? (actionType === 'SWAP' ? 'is-moved is-active' : 'is-compared is-active') : ''
              } ${isSorted ? 'is-sorted is-sorted-cell' : ''}`}
            >
              <small>{idx}</small>
              <b>{val}</b>
            </div>
          );
        })}
        {array.length === 0 && (
          <div className="sorting-empty-notice" data-testid="sorting-empty">
            Empty array (N = 0)
          </div>
        )}
      </div>
    );
  }

  // SORTING_BARS Visual Mode
  return (
    <div
      className="chrono-engine sorting-bars-container"
      data-testid="chrono-engine"
      data-mode="SORTING_BARS"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div className="sorting-bars-viewport" role="region" aria-label="Sorting bars visualizer">
        {array.map((val, idx) => {
          const isActive = activeIndices.has(idx);
          const isSorted = sortedIndices.has(idx);

          // Scaled height percentage: between 12% and 94%
          const pct = Math.max(12, Math.min(94, ((val - minVal) / range) * 82 + 12));

          let activeClass = '';
          if (isActive) {
            if (actionType === 'SWAP') activeClass = 'bar-active-swap';
            else if (actionType === 'COMPARE') activeClass = 'bar-active-compare';
            else activeClass = 'bar-active-overwrite';
          }

          return (
            <div
              key={idx}
              className="sorting-bar-wrapper"
              data-testid={`sorting-bar-wrapper-${idx}`}
            >
              <div
                data-testid={`sorting-bar-${idx}`}
                data-index={idx}
                data-value={val}
                data-active={isActive}
                data-sorted={isSorted}
                data-action={isActive ? actionType : undefined}
                className={`sorting-bar ${isActive ? 'is-active ' + activeClass : ''} ${
                  isSorted ? 'is-sorted' : ''
                }`}
                style={{ height: `${pct}%` }}
                title={`Index: ${idx}, Value: ${val}${isSorted ? ' (Sorted)' : ''}${
                  isActive ? ` (${actionType})` : ''
                }`}
              >
                {showValues && <span className="sorting-bar-value">{val}</span>}
              </div>
              {showIndices && <span className="sorting-bar-index">{idx}</span>}
            </div>
          );
        })}
        {array.length === 0 && (
          <div className="sorting-empty-notice" data-testid="sorting-empty">
            Empty array (N = 0)
          </div>
        )}
      </div>
      {step?.description && (
        <div className="sorting-step-description" data-testid="sorting-step-desc">
          {step.description}
        </div>
      )}
    </div>
  );
}
