import React from 'react';

export interface MiniGraphicProps {
  category: string;
  className?: string;
}

export function MiniGraphic({ category, className = '' }: MiniGraphicProps) {
  const cat = (category || '').toLowerCase();

  // 1. Searching Algorithms (Search, Array, String pattern matching)
  if (cat.includes('search') || cat.includes('array') || cat.includes('string')) {
    return (
      <div
        className={`mini-graphic searching-graphic relative flex items-center justify-center w-full select-none pointer-events-none ${className}`}
        aria-hidden="true"
        data-category-shape="searching"
      >
        <div className="flex items-center justify-center gap-2">
          <div className="graphic-block block-iso" />
          <div className="graphic-block block-iso" />
          <div className="graphic-block block-iso" />
          <div className="graphic-block is-target block-iso-target" />
          <div className="graphic-block block-iso" />
          <div className="graphic-block block-iso" />
          <div className="graphic-block block-iso" />
        </div>
      </div>
    );
  }

  // 2. Sorting Algorithms
  if (cat.includes('sort')) {
    return (
      <div
        className={`mini-graphic sorting-graphic relative flex items-center justify-center w-full select-none pointer-events-none ${className}`}
        aria-hidden="true"
        data-category-shape="sorting"
      >
        <div className="flex items-end justify-center gap-2 h-9">
          <div className="graphic-bar bar-1" />
          <div className="graphic-bar bar-2" />
          <div className="graphic-bar bar-3 is-pivot" />
          <div className="graphic-bar bar-4 is-highlight" />
          <div className="graphic-bar bar-5" />
        </div>
      </div>
    );
  }

  // 3. Trees & Graphs (Tree, Graph, Backtracking)
  if (cat.includes('tree') || cat.includes('graph') || cat.includes('backtrack')) {
    const isGraph = cat.includes('graph');
    return (
      <div
        className={`mini-graphic tree-graph-graphic relative flex items-center justify-center w-full select-none pointer-events-none ${className}`}
        aria-hidden="true"
        data-category-shape="trees-graphs"
      >
        {isGraph ? (
          /* Graph Network: 4 outer corner nodes + 1 central glowing neon cube */
          <div className="relative w-24 h-12 flex items-center justify-center">
            {/* Connecting lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="line-nw absolute top-2 left-3 w-9 h-[1px] bg-[#c4f34a]/35 rotate-[22deg] origin-left" />
              <div className="line-ne absolute top-2 right-3 w-9 h-[1px] bg-[#c4f34a]/35 -rotate-[22deg] origin-right" />
              <div className="line-sw absolute bottom-2 left-3 w-9 h-[1px] bg-[#c4f34a]/35 -rotate-[22deg] origin-left" />
              <div className="line-se absolute bottom-2 right-3 w-9 h-[1px] bg-[#c4f34a]/35 rotate-[22deg] origin-right" />
              <div className="line-top absolute top-2 left-3 right-3 h-[1px] bg-[#c4f34a]/25" />
              <div className="line-bottom absolute bottom-2 left-3 right-3 h-[1px] bg-[#c4f34a]/25" />
            </div>
            {/* Corner nodes */}
            <div className="outer-node node-tl absolute top-0.5 left-2" />
            <div className="outer-node node-tr absolute top-0.5 right-2" />
            <div className="outer-node node-bl absolute bottom-0.5 left-2" />
            <div className="outer-node node-br absolute bottom-0.5 right-2" />
            {/* Center glowing green cube */}
            <div className="center-glowing-cube z-10" />
          </div>
        ) : (
          /* Tree formation: top root node + branch lines + bottom nodes */
          <div className="relative w-20 h-11 flex flex-col items-center justify-between">
            <div className="tree-top-row flex justify-center z-10">
              <div className="graphic-node is-root" />
            </div>
            <div className="tree-branch-lines absolute inset-0 pointer-events-none">
              <div className="branch-line left-branch absolute top-[10px] left-[16px] w-6 h-[1.5px] bg-[#c4f34a]/40 -rotate-[32deg] origin-left" />
              <div className="branch-line right-branch absolute top-[10px] right-[16px] w-6 h-[1.5px] bg-[#c4f34a]/40 rotate-[32deg] origin-right" />
            </div>
            <div className="tree-bottom-row w-full flex justify-between px-2 z-10">
              <div className="graphic-node child-node" />
              <div className="graphic-node child-node is-active-child" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. Dynamic Programming (DP) / Matrices
  if (cat.includes('dynamic') || cat.includes('dp') || cat.includes('matrix')) {
    return (
      <div
        className={`mini-graphic dp-matrix-graphic relative flex items-center justify-center w-full select-none pointer-events-none ${className}`}
        aria-hidden="true"
        data-category-shape="dp-matrices"
      >
        <div className="dp-grid grid grid-cols-3 gap-1.5 p-1.5 rounded-md">
          <div className="dp-cell" />
          <div className="dp-cell" />
          <div className="dp-cell is-computed" />
          <div className="dp-cell" />
          <div className="dp-cell is-computed" />
          <div className="dp-cell" />
          <div className="dp-cell is-computed" />
          <div className="dp-cell" />
          <div className="dp-cell is-optimal" />
        </div>
      </div>
    );
  }

  // 5. Default / Mathematical (Number Theory, Geometry, Bitwise, Greedy, etc.)
  return (
    <div
      className={`mini-graphic math-default-graphic relative flex items-center justify-center w-full select-none pointer-events-none ${className}`}
      aria-hidden="true"
      data-category-shape="math-default"
    >
      <div className="relative w-10 h-10 flex items-center justify-center">
        <div className="overlapping-square square-back" />
        <div className="overlapping-square square-front" />
      </div>
    </div>
  );
}
