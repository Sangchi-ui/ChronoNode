import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, ArrowRight } from 'lucide-react';
import { allAlgorithms, algorithmCategories, type AlgorithmData } from './data/algorithms';

interface AlgorithmsPanelProps {
  onSelectAlgorithm: (algo: AlgorithmData) => void;
  onLoadCode?: (code: string) => void;
}

export function AlgorithmsPanel({ onSelectAlgorithm }: AlgorithmsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAlgorithms = useMemo(() => {
    return allAlgorithms.filter(algo => {
      const matchesCategory = selectedCategory === 'All' || algo.category === selectedCategory;
      const matchesSearch =
        algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="algorithms-workspace w-full" aria-label="Algorithms library">
      {/* Header & Filter Controls */}
      <div className="algo-header w-full">
        <div className="algo-title-block">
          <h2>Algorithms Library</h2>
          <span className="algo-counter-badge">
            {filteredAlgorithms.length} of {allAlgorithms.length} algorithms
          </span>
        </div>

        <div className="algo-search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search algorithms, concepts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search algorithms"
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills - Full Width Wrapping Chip Cloud (No Collapse) */}
      <div
        className="algo-category-pills w-full flex flex-wrap gap-2.5"
        role="tablist"
        aria-label="Algorithm categories"
      >
        {algorithmCategories.map(cat => (
          <button
            key={cat}
            className={`algo-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
            role="tab"
            aria-selected={selectedCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 6-Column Responsive Card Grid (Square Cards, Clean Design) */}
      <div
        className="algo-grid w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
        role="grid"
      >
        {filteredAlgorithms.map(algo => (
          <button
            key={algo.id}
            className="algo-card aspect-square"
            onClick={() => onSelectAlgorithm(algo)}
            aria-label={`Open learning page for ${algo.name}`}
          >
            <div className="algo-card-inner">
              <div className="algo-card-top">
                <span className="algo-card-category">{algo.category.replace(' Algorithms', '')}</span>
              </div>
              <h3 className="algo-card-title">{algo.name}</h3>
              <div className="algo-card-bottom">
                <span className="algo-card-prompt">
                  Learn <ArrowRight size={13} style={{ display: 'inline', marginLeft: 2 }} />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredAlgorithms.length === 0 && (
        <div className="algo-empty-state">
          <BookOpen size={36} />
          <p>No algorithms found matching &quot;{searchQuery}&quot; in {selectedCategory}.</p>
          <button
            className="reset-filter-btn"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
