import React from 'react';
import type { SortingStep, SortingActionType, SubArrayBlock } from './sorting/sortingGenerators';

export type VisualMode =
  | 'SORTING_BARS'
  | 'STANDARD_BAR_CHART'
  | '1D_ARRAY'
  | 'ARRAY_CELLS'
  | 'DIVIDE_AND_CONQUER'
  | 'PARTITION_SWAP';

export interface ChronoEngineProps {
  mode?: VisualMode;
  algorithm?: string;
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
 * ChronoEngine: Advanced Visual rendering engine for algorithm execution.
 * Pedagogically specialized for live classroom lectures:
 * 1. DIVIDE_AND_CONQUER (Merge Sort): Physically separates sub-arrays with visual gaps and pointers.
 * 2. PARTITION_SWAP (Quick Sort): Highlights pivot in neon purple and frames the active partition boundary.
 * 3. STANDARD_BAR_CHART / 1D_ARRAY (Bubble, Insertion, Selection): Sequential boundary locking and comparisons.
 */
export function ChronoEngine({
  mode,
  algorithm,
  step,
  array: propArray,
  activeIndices: propActiveIndices,
  actionType: propActionType,
  sortedIndices: propSortedIndices,
  maxValue: propMax,
  height = 340,
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

  // Auto-resolve visual mode based on algorithm or step properties
  let effectiveMode: VisualMode = mode || 'SORTING_BARS';
  if (algorithm === 'merge-sort' || (!mode && step?.subArrays && step.subArrays.length > 0)) {
    effectiveMode = 'DIVIDE_AND_CONQUER';
  } else if (
    algorithm === 'quick-sort' ||
    (!mode && (step?.pivotIndex !== undefined || step?.partitionRange !== undefined))
  ) {
    effectiveMode = 'PARTITION_SWAP';
  } else if (mode === 'STANDARD_BAR_CHART' || mode === '1D_ARRAY') {
    effectiveMode = 'SORTING_BARS';
  }

  /* =========================================================================
     Mode 1: ARRAY_CELLS Mode
     ========================================================================= */
  if (effectiveMode === 'ARRAY_CELLS') {
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

  /* =========================================================================
     Mode 2: DIVIDE_AND_CONQUER Mode (Specifically for Merge Sort)
     ========================================================================= */
  if (effectiveMode === 'DIVIDE_AND_CONQUER') {
    const subArrays: SubArrayBlock[] = step?.subArrays || [];
    const isSplitting = actionType === 'SPLIT';
    const isMerging = actionType === 'MERGE' || actionType === 'COMPARE' || actionType === 'OVERWRITE';

    return (
      <div
        className="chrono-engine divide-conquer-container"
        data-testid="chrono-engine"
        data-mode="DIVIDE_AND_CONQUER"
        style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
      >
        {/* Divide & Conquer Phase Header */}
        <div className="divide-conquer-header" data-testid="divide-conquer-header">
          <div className="phase-pill">
            <span className="phase-tag">DIVIDE & CONQUER</span>
            <b className="phase-action">
              {isSplitting ? 'DIVIDE: SUB-ARRAY PARTITIONING' : 'CONQUER: TWO-POINTER MERGING'}
            </b>
          </div>
          {step?.activeLevel !== undefined && (
            <span className="recursion-depth-badge">Tree Level {step.activeLevel}</span>
          )}
        </div>

        {/* Separated Sub-Array Blocks */}
        {subArrays.length > 0 ? (
          <div className="divide-conquer-subarrays" data-testid="divide-conquer-subarrays">
            {subArrays.map((sub, sIdx) => {
              const isLeft = sIdx === 0;
              const pointerIdx = isLeft ? step?.leftPointer : step?.rightPointer;

              return (
                <div
                  key={sub.id || sIdx}
                  className={`sub-array-card ${isLeft ? 'sub-array-left' : 'sub-array-right'} ${
                    sub.active ? 'is-active-sub' : ''
                  }`}
                  data-testid={`subarray-${isLeft ? 'left' : 'right'}`}
                >
                  <div className="sub-array-title">
                    <span>{isLeft ? 'LEFT SUB-ARRAY' : 'RIGHT SUB-ARRAY'}</span>
                    <small>indices [{sub.start}..{sub.end}]</small>
                  </div>
                  <div className="sub-array-elements">
                    {sub.values.map((v, localIdx) => {
                      const globalIdx = sub.start + localIdx;
                      const hasPointer = pointerIdx === globalIdx;
                      const isCompared = activeIndices.has(globalIdx);

                      return (
                        <div
                          key={globalIdx}
                          className={`sub-cell ${hasPointer ? 'has-pointer' : ''} ${
                            isCompared ? 'is-active' : ''
                          }`}
                          data-testid={`sub-cell-${globalIdx}`}
                          data-value={v}
                        >
                          {hasPointer && (
                            <span className="sub-pointer-tag">
                              {isLeft ? 'L' : 'R'}
                            </span>
                          )}
                          <span className="sub-val">{v}</span>
                          <span className="sub-idx">{globalIdx}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="divide-conquer-subarrays placeholder">
            <span className="muted">Sub-arrays partition recursively during Divide phase</span>
          </div>
        )}

        {/* Merged Target / Full Array View */}
        <div className="divide-conquer-merged-section">
          <div className="merged-label">
            <span>FULL ARRAY STATE {isMerging ? '(MERGING INTO TARGET)' : ''}</span>
          </div>
          <div className="sorting-bars-viewport">
            {array.map((val, idx) => {
              const isActive = activeIndices.has(idx);
              const isSorted = sortedIndices.has(idx);
              const isTarget = step?.mergedTargetIndex === idx;
              const pct = Math.max(14, Math.min(94, ((val - minVal) / range) * 80 + 14));

              return (
                <div key={idx} className="sorting-bar-wrapper" data-testid={`sorting-bar-wrapper-${idx}`}>
                  <div
                    data-testid={`sorting-bar-${idx}`}
                    data-index={idx}
                    data-value={val}
                    data-active={isActive}
                    data-sorted={isSorted}
                    data-action={isActive ? actionType : undefined}
                    className={`sorting-bar ${isActive ? 'is-active bar-active-compare' : ''} ${
                      isSorted ? 'is-sorted' : ''
                    } ${isTarget ? 'is-target-merged' : ''}`}
                    style={{ height: `${pct}%` }}
                    title={`Index: ${idx}, Value: ${val}${isSorted ? ' (Sorted)' : ''}`}
                  >
                    {isTarget && <span className="target-merge-badge">MERGE</span>}
                    {showValues && <span className="sorting-bar-value">{val}</span>}
                  </div>
                  {showIndices && <span className="sorting-bar-index">{idx}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {step?.description && (
          <div className="sorting-step-description" data-testid="sorting-step-desc">
            {step.description}
          </div>
        )}
      </div>
    );
  }

  /* =========================================================================
     Mode 3: PARTITION_SWAP Mode (Specifically for Quick Sort)
     ========================================================================= */
  if (effectiveMode === 'PARTITION_SWAP') {
    const partitionRange = step?.partitionRange || [0, array.length - 1];
    const pivotIndex = step?.pivotIndex;
    const boundaryPointer = step?.boundaryPointer ?? step?.leftPointer;
    const scanPointer = step?.scanPointer ?? step?.rightPointer;

    return (
      <div
        className="chrono-engine partition-swap-container"
        data-testid="chrono-engine"
        data-mode="PARTITION_SWAP"
        style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
      >
        {/* Quick Sort Partition Telemetry Bar */}
        <div className="partition-header" data-testid="partition-header">
          <div className="partition-badge">
            <span className="partition-tag">PARTITION SWAP</span>
            <b>Active Range: [{partitionRange[0]}..{partitionRange[1]}]</b>
          </div>
          {pivotIndex !== undefined && (
            <div className="pivot-indicator-badge" data-testid="pivot-indicator">
              <span className="pivot-dot" />
              <span>
                Pivot: <b>arr[{pivotIndex}] = {array[pivotIndex]}</b>
              </span>
            </div>
          )}
        </div>

        <div className="sorting-bars-viewport" role="region" aria-label="Quick Sort partition viewport">
          {array.map((val, idx) => {
            const isPivot = pivotIndex === idx;
            const isInPartition = idx >= partitionRange[0] && idx <= partitionRange[1];
            const isBoundary = boundaryPointer === idx;
            const isScan = scanPointer === idx && !isPivot;
            const isActive = activeIndices.has(idx);
            const isSorted = sortedIndices.has(idx);

            const pct = Math.max(12, Math.min(94, ((val - minVal) / range) * 82 + 12));

            let activeClass = '';
            if (isActive) {
              if (actionType === 'SWAP') activeClass = 'bar-active-swap';
              else if (actionType === 'COMPARE') activeClass = 'bar-active-compare';
              else activeClass = 'bar-active-overwrite';
            }

            return (
              <div key={idx} className="sorting-bar-wrapper" data-testid={`sorting-bar-wrapper-${idx}`}>
                <div
                  data-testid={`sorting-bar-${idx}`}
                  data-index={idx}
                  data-value={val}
                  data-active={isActive}
                  data-sorted={isSorted}
                  data-pivot={isPivot}
                  data-in-partition={isInPartition}
                  data-action={isActive ? actionType : undefined}
                  className={`sorting-bar ${isActive ? 'is-active ' + activeClass : ''} ${
                    isSorted ? 'is-sorted' : ''
                  } ${isPivot ? 'bar-pivot' : ''} ${isInPartition ? 'is-in-partition' : 'is-outside-partition'}`}
                  style={{ height: `${pct}%` }}
                  title={`Index: ${idx}, Value: ${val}${isPivot ? ' (PIVOT)' : ''}${
                    isSorted ? ' (Sorted)' : ''
                  }${isInPartition ? ' [In Partition]' : ' [Outside]'}`}
                >
                  {isPivot && <span className="pivot-floating-tag">PIVOT</span>}
                  {isBoundary && !isPivot && <span className="pointer-tag boundary-tag">i</span>}
                  {isScan && !isPivot && <span className="pointer-tag scan-tag">j</span>}
                  {showValues && <span className="sorting-bar-value">{val}</span>}
                </div>
                {showIndices && <span className="sorting-bar-index">{idx}</span>}
              </div>
            );
          })}
        </div>

        {step?.description && (
          <div className="sorting-step-description" data-testid="sorting-step-desc">
            {step.description}
          </div>
        )}
      </div>
    );
  }

  /* =========================================================================
     Mode 4: STANDARD_BAR_CHART / SORTING_BARS (Sequential Sorts: Bubble, Selection, Insertion)
     ========================================================================= */
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
