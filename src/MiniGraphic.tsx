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
        className={`mini-graphic searching-graphic relative flex items-center justify-center w-full h-12 overflow-hidden rounded-lg bg-slate-900/40 backdrop-blur-md border border-slate-800/60 shadow-inner select-none pointer-events-none ${className}`}
        aria-hidden="true"
        data-category-shape="searching"
      >
        <div className="flex items-center justify-center gap-1.5">
          <div className="graphic-block w-2.5 h-2.5 rounded-sm bg-slate-800/80 border border-slate-700/60 backdrop-blur-sm" />
          <div className="graphic-block w-2.5 h-2.5 rounded-sm bg-slate-800/80 border border-slate-700/60 backdrop-blur-sm" />
          <div className="graphic-block is-target w-3 h-3 rounded-sm bg-[#c4f34a] border border-[#d9f99d] shadow-[0_0_12px_rgba(196,243,74,0.85)] scale-110" />
          <div className="graphic-block w-2.5 h-2.5 rounded-sm bg-slate-800/80 border border-slate-700/60 backdrop-blur-sm" />
          <div className="graphic-block w-2.5 h-2.5 rounded-sm bg-slate-800/80 border border-slate-700/60 backdrop-blur-sm" />
          <div className="graphic-block w-2.5 h-2.5 rounded-sm bg-slate-800/80 border border-slate-700/60 backdrop-blur-sm" />
        </div>
      </div>
    );
  }

  // 2. Sorting Algorithms
  if (cat.includes('sort')) {
    return (
      <div
        className={`mini-graphic sorting-graphic relative flex items-center justify-center w-full h-12 overflow-hidden rounded-lg bg-slate-900/40 backdrop-blur-md border border-slate-800/60 shadow-inner select-none pointer-events-none ${className}`}
        aria-hidden="true"
        data-category-shape="sorting"
      >
        <div className="flex items-end justify-center gap-1.5 h-7">
          <div className="graphic-bar bar-1 w-2 rounded-t-sm bg-slate-800/80 border-t border-x border-slate-700/60 h-2.5" />
          <div className="graphic-bar bar-2 w-2 rounded-t-sm bg-slate-800/80 border-t border-x border-slate-700/60 h-4" />
          <div className="graphic-bar bar-3 is-pivot w-2 rounded-t-sm bg-[#c4f34a] border-t border-x border-[#d9f99d] shadow-[0_0_12px_rgba(196,243,74,0.85)] h-7" />
          <div className="graphic-bar bar-4 is-highlight w-2 rounded-t-sm bg-[#a3e635] border-t border-x border-[#d9f99d] shadow-[0_0_8px_rgba(196,243,74,0.65)] h-5" />
          <div className="graphic-bar bar-5 w-2 rounded-t-sm bg-slate-800/80 border-t border-x border-slate-700/60 h-3.5" />
        </div>
      </div>
    );
  }

  // 3. Trees & Graphs (Tree, Graph, Backtracking)
  if (cat.includes('tree') || cat.includes('graph') || cat.includes('backtrack')) {
    return (
      <div
        className={`mini-graphic tree-graph-graphic relative flex items-center justify-center w-full h-12 overflow-hidden rounded-lg bg-slate-900/40 backdrop-blur-md border border-slate-800/60 shadow-inner select-none pointer-events-none ${className}`}
        aria-hidden="true"
        data-category-shape="trees-graphs"
      >
        <div className="relative w-12 h-8 flex flex-col items-center justify-between">
          {/* Top root node */}
          <div className="tree-top-row flex justify-center z-10">
            <div className="graphic-node is-root rounded-full w-2.5 h-2.5 bg-[#c4f34a] border border-[#d9f99d] shadow-[0_0_10px_rgba(196,243,74,0.85)]" />
          </div>
          {/* Branch connecting lines */}
          <div className="tree-branch-lines absolute inset-0 pointer-events-none">
            <div className="branch-line left-branch absolute top-[7px] left-[10px] w-4 h-[1px] bg-slate-600/70 -rotate-[30deg] origin-left" />
            <div className="branch-line right-branch absolute top-[7px] right-[10px] w-4 h-[1px] bg-slate-600/70 rotate-[30deg] origin-right" />
          </div>
          {/* Bottom child nodes */}
          <div className="tree-bottom-row w-full flex justify-between px-1 z-10">
            <div className="graphic-node child-node rounded-full w-2.5 h-2.5 bg-slate-800/90 border border-slate-700/80" />
            <div className="graphic-node child-node is-active-child rounded-full w-2.5 h-2.5 bg-[#c4f34a]/80 border border-[#d9f99d] shadow-[0_0_8px_rgba(196,243,74,0.6)]" />
          </div>
        </div>
      </div>
    );
  }

  // 4. Dynamic Programming (DP) / Matrices
  if (cat.includes('dynamic') || cat.includes('dp') || cat.includes('matrix')) {
    return (
      <div
        className={`mini-graphic dp-matrix-graphic relative flex items-center justify-center w-full h-12 overflow-hidden rounded-lg bg-slate-900/40 backdrop-blur-md border border-slate-800/60 shadow-inner select-none pointer-events-none ${className}`}
        aria-hidden="true"
        data-category-shape="dp-matrices"
      >
        <div className="dp-grid grid grid-cols-3 gap-1 p-1 bg-slate-950/40 rounded border border-slate-800/60 backdrop-blur-sm">
          <div className="dp-cell w-2 h-2 rounded-[2px] bg-slate-800/70 border border-slate-700/50" />
          <div className="dp-cell w-2 h-2 rounded-[2px] bg-slate-800/70 border border-slate-700/50" />
          <div className="dp-cell is-computed w-2 h-2 rounded-[2px] bg-[#c4f34a]/40 border border-[#c4f34a]/70" />
          <div className="dp-cell w-2 h-2 rounded-[2px] bg-slate-800/70 border border-slate-700/50" />
          <div className="dp-cell is-computed w-2 h-2 rounded-[2px] bg-[#c4f34a]/60 border border-[#c4f34a]/80 shadow-[0_0_6px_rgba(196,243,74,0.4)]" />
          <div className="dp-cell w-2 h-2 rounded-[2px] bg-slate-800/70 border border-slate-700/50" />
          <div className="dp-cell is-computed w-2 h-2 rounded-[2px] bg-[#c4f34a]/40 border border-[#c4f34a]/70" />
          <div className="dp-cell w-2 h-2 rounded-[2px] bg-slate-800/70 border border-slate-700/50" />
          <div className="dp-cell is-optimal w-2 h-2 rounded-[2px] bg-[#c4f34a] border border-[#d9f99d] shadow-[0_0_10px_rgba(196,243,74,0.9)]" />
        </div>
      </div>
    );
  }

  // 5. Default / Mathematical (Number Theory, Geometry, Bitwise, Greedy, etc.)
  return (
    <div
      className={`mini-graphic math-default-graphic relative flex items-center justify-center w-full h-12 overflow-hidden rounded-lg bg-slate-900/40 backdrop-blur-md border border-slate-800/60 shadow-inner select-none pointer-events-none ${className}`}
      aria-hidden="true"
      data-category-shape="math-default"
    >
      <div className="relative w-8 h-8 flex items-center justify-center">
        {/* Back square */}
        <div className="overlapping-square square-back absolute top-0 left-0 w-4.5 h-4.5 rounded-[2px] border border-slate-600/70 bg-slate-800/30 backdrop-blur-sm" />
        {/* Front overlapping square with neon-green glow */}
        <div className="overlapping-square square-front absolute bottom-0 right-0 w-4.5 h-4.5 rounded-[2px] border border-[#c4f34a] bg-slate-900/40 backdrop-blur-sm shadow-[0_0_10px_rgba(196,243,74,0.75)]" />
      </div>
    </div>
  );
}
