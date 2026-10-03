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
 * - Direct rendering on the primary dotted-grid canvas with zero nested dark card bounding boxes.
 * - Globally unified large element sizing (.array-cell w-14 h-16 / w-14 h-14) matching Linear Search.
 * - Distinct structural logic for Divide & Conquer (Merge Sort) and Partition Swap (Quick Sort).
 * - Full resolution of completed sorting runs to a single contiguous 1D array locked in solid green.
 */
export function ChronoEngine({
  mode,
  algorithm,
  step,
  array: propArray,
  activeIndices: propActiveIndices,
  actionType: propActionType,
  sortedIndices: propSortedIndices,
  height,
}: ChronoEngineProps) {
  // Extract values from step if provided, or fallback to direct props
  const array = step ? step.array : (propArray || []);
  const activeIndices = new Set(step ? step.indices : (propActiveIndices || []));
  const actionType = step ? step.type : (propActionType || 'COMPARE');
  const sortedIndices = new Set(step ? step.sortedIndices : (propSortedIndices || []));

  const isFullySorted = array.length > 0 && sortedIndices.size === array.length;
  const hasSubArrays = Boolean(step?.subArrays && step.subArrays.length > 0);

  // Auto-resolve visual mode based on algorithm or step properties
  let effectiveMode: VisualMode = mode || 'SORTING_BARS';
  if (isFullySorted) {
    // When the whole array is sorted, resolve strictly to single contiguous 1D array on main canvas
    effectiveMode = 'SORTING_BARS';
  } else if (mode === 'DIVIDE_AND_CONQUER' || algorithm === 'merge-sort' || (!mode && hasSubArrays)) {
    effectiveMode = 'DIVIDE_AND_CONQUER';
  } else if (
    algorithm === 'quick-sort' ||
    (!mode && (step?.pivotIndex !== undefined || step?.partitionRange !== undefined))
  ) {
    effectiveMode = 'PARTITION_SWAP';
  } else if (mode === 'STANDARD_BAR_CHART' || mode === '1D_ARRAY' || mode === 'ARRAY_CELLS') {
    effectiveMode = 'SORTING_BARS';
  }

  /* =========================================================================
     Mode 1: DIVIDE_AND_CONQUER Mode (Specifically for active Merge Sort steps)
     ========================================================================= */
  if (effectiveMode === 'DIVIDE_AND_CONQUER') {
    const subArrays: SubArrayBlock[] = step?.subArrays || [];
    const isSplitting = actionType === 'SPLIT';
    const isMerging = actionType === 'MERGE' || actionType === 'COMPARE' || actionType === 'OVERWRITE';

    return (
      <div
        className="chrono-engine array-view divide-conquer-container"
        data-testid="chrono-engine"
        data-mode="DIVIDE_AND_CONQUER"
        style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
      >
        {/* Subtle Divide & Conquer Header (no dark card box!) */}
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

        {/* Separated Sub-Array Blocks floating directly on dotted canvas */}
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
                        className={`array-cell sub-cell ${hasPointer ? 'has-pointer' : ''} ${
                          isCompared ? 'is-active is-compared' : ''
                        }`}
                        data-testid={`sub-cell-${globalIdx}`}
                        data-value={v}
                      >
                        {hasPointer && (
                          <span className="sub-pointer-tag">
                            {isLeft ? 'L' : 'R'}
                          </span>
                        )}
                        <small className="sub-idx">{globalIdx}</small>
                        <b className="sub-val">{v}</b>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full / Destination Array View floating directly on canvas */}
        <div className="divide-conquer-merged-section">
          <div className="merged-label">
            <span>FULL ARRAY STATE {isMerging ? '(MERGING INTO TARGET)' : ''}</span>
          </div>
          <div className="sorting-bars-viewport">
            {array.map((val, idx) => {
              const isActive = activeIndices.has(idx);
              const isSorted = sortedIndices.has(idx);
              const isTarget = step?.mergedTargetIndex === idx;

              return (
                <div key={idx} className="sorting-bar-wrapper" data-testid={`sorting-bar-wrapper-${idx}`}>
                  <div
                    data-testid={`sorting-bar-${idx}`}
                    data-index={idx}
                    data-value={val}
                    data-active={isActive}
                    data-sorted={isSorted}
                    data-action={isActive ? actionType : undefined}
                    className={`array-cell sorting-bar ${isActive ? 'is-active bar-active-compare is-compared' : ''} ${
                      isSorted ? 'is-sorted is-sorted-cell' : ''
                    } ${isTarget ? 'is-target-merged' : ''}`}
                    title={`Index: ${idx}, Value: ${val}${isSorted ? ' (Sorted)' : ''}`}
                  >
                    {isTarget && <span className="target-merge-badge">MERGE</span>}
                    <small className="sorting-bar-index">{idx}</small>
                    <b className="sorting-bar-value">{val}</b>
                  </div>
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
     Mode 2: PARTITION_SWAP Mode (Specifically for Quick Sort steps)
     ========================================================================= */
  if (effectiveMode === 'PARTITION_SWAP') {
    const partitionRange = step?.partitionRange || [0, array.length - 1];
    const pivotIndex = step?.pivotIndex;
    const boundaryPointer = step?.boundaryPointer ?? step?.leftPointer;
    const scanPointer = step?.scanPointer ?? step?.rightPointer;

    return (
      <div
        className="chrono-engine array-view partition-swap-container"
        data-testid="chrono-engine"
        data-mode="PARTITION_SWAP"
        style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
      >
        {/* Subtle Partition Telemetry Bar (no dark card wrapper!) */}
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

        {/* Free-floating array blocks directly on primary dotted canvas */}
        <div className="sorting-bars-viewport" role="region" aria-label="Quick Sort partition viewport">
          {array.map((val, idx) => {
            const isPivot = pivotIndex === idx;
            const isInPartition = idx >= partitionRange[0] && idx <= partitionRange[1];
            const isBoundary = boundaryPointer === idx;
            const isScan = scanPointer === idx && !isPivot;
            const isActive = activeIndices.has(idx);
            const isSorted = sortedIndices.has(idx);

            let activeClass = '';
            if (isActive) {
              if (actionType === 'SWAP') activeClass = 'bar-active-swap is-moved';
              else if (actionType === 'COMPARE') activeClass = 'bar-active-compare is-compared';
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
                  className={`array-cell sorting-bar ${isActive ? 'is-active ' + activeClass : ''} ${
                    isSorted ? 'is-sorted is-sorted-cell' : ''
                  } ${isPivot ? 'bar-pivot' : ''} ${isInPartition ? 'is-in-partition' : 'is-outside-partition'}`}
                  title={`Index: ${idx}, Value: ${val}${isPivot ? ' (PIVOT)' : ''}${
                    isSorted ? ' (Sorted)' : ''
                  }${isInPartition ? ' [In Partition]' : ' [Outside]'}`}
                >
                  {isPivot && <span className="pivot-floating-tag">PIVOT</span>}
                  {isBoundary && <span className="pointer-tag boundary-tag">i</span>}
                  {isScan && <span className="pointer-tag scan-tag">j</span>}
                  <small className="sorting-bar-index">{idx}</small>
                  <b className="sorting-bar-value">{val}</b>
                </div>
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
     Mode 3: STANDARD 1D ARRAY Mode (Sequential sorts & Final Sorted State)
     ========================================================================= */
  return (
    <div
      className="chrono-engine array-view sorting-bars-container"
      data-testid="chrono-engine"
      data-mode="SORTING_BARS"
      style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
    >
      <div className="sorting-bars-viewport" role="region" aria-label="Sorting array viewport">
        {array.map((val, idx) => {
          const isActive = activeIndices.has(idx);
          const isSorted = sortedIndices.has(idx);

          let activeClass = '';
          if (isActive) {
            if (actionType === 'SWAP') activeClass = 'bar-active-swap is-moved';
            else if (actionType === 'COMPARE') activeClass = 'bar-active-compare is-compared';
            else activeClass = 'bar-active-overwrite';
          }

          const isTarget = step?.mergedTargetIndex === idx;

          return (
            <div key={idx} className="sorting-bar-wrapper" data-testid={`sorting-bar-wrapper-${idx}`}>
              <div
                data-testid={`sorting-bar-${idx}`}
                data-index={idx}
                data-value={val}
                data-active={isActive}
                data-sorted={isSorted}
                data-action={isActive ? actionType : undefined}
                className={`array-cell sorting-bar ${isActive ? 'is-active ' + activeClass : ''} ${
                  isSorted ? 'is-sorted is-sorted-cell' : ''
                } ${isTarget ? 'is-target-merged' : ''}`}
                title={`Index: ${idx}, Value: ${val}${isSorted ? ' (Sorted)' : ''}`}
              >
                {isTarget && <span className="target-merge-badge">MERGE</span>}
                <small className="sorting-bar-index">{idx}</small>
                <b className="sorting-bar-value">{val}</b>
              </div>
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
