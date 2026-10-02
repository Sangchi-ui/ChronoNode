import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, Clock, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { allAlgorithms, algorithmCategories, type AlgorithmData } from './data/algorithms';

interface AlgorithmsPanelProps {
  onSelectAlgorithm: (algo: AlgorithmData) => void;
  onLoadCode?: (code: string) => void;
}

export function AlgorithmsPanel({ onSelectAlgorithm }: AlgorithmsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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
    <div className="algorithms-workspace" aria-label="Algorithms library">
      {/* Header & Filter Controls */}
      <div className="algo-header">
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
            placeholder="Search algorithms, concepts, complexities..."
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

      {/* Category Pills - Wrapping Chip Cloud */}
      <div className="algo-category-container">
        <div
          className={`algo-category-pills ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
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
        <button
          type="button"
          className="algo-pills-toggle-btn"
          onClick={() => setIsExpanded(prev => !prev)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse categories' : 'Expand all categories'}
          title={isExpanded ? 'Collapse categories' : 'Show all categories'}
        >
          <span>{isExpanded ? 'Collapse' : `Expand (${algorithmCategories.length})`}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Uniform Square Card Grid */}
      <div className="algo-grid" role="grid">
        {filteredAlgorithms.map(algo => (
          <button
            key={algo.id}
            className="algo-card"
            onClick={() => onSelectAlgorithm(algo)}
            aria-label={`Open learning page for ${algo.name}`}
          >
            <div className="algo-card-inner">
              <div className="algo-card-top">
                <span className="algo-card-category">{algo.category.replace(' Algorithms', '')}</span>
                <span className="algo-card-chip">{algo.complexity.time}</span>
              </div>
              <h3 className="algo-card-title">{algo.name}</h3>
              <div className="algo-card-bottom">
                <span className="algo-card-space">Space {algo.complexity.space}</span>
                <span className="algo-card-prompt">
                  Learn <ArrowRight size={11} style={{ display: 'inline', marginLeft: 2 }} />
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
