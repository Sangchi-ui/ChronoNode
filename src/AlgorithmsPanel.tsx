import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Copy, Check, Play, Clock, Database, Sparkles, BookOpen, Layers } from 'lucide-react';
import { allAlgorithms, algorithmCategories, type AlgorithmData } from './data/algorithms';

interface AlgorithmsPanelProps {
  onLoadCode: (code: string) => void;
}

export function AlgorithmsPanel({ onLoadCode }: AlgorithmsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeAlgorithm, setActiveAlgorithm] = useState<AlgorithmData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

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

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoad = (code: string) => {
    onLoadCode(code);
    setActiveAlgorithm(null);
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveAlgorithm(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
            <button className="clear-search-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="algo-category-pills" role="tablist" aria-label="Algorithm categories">
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

      {/* Uniform Square Card Grid */}
      <div className="algo-grid" role="grid">
        {filteredAlgorithms.map(algo => (
          <button
            key={algo.id}
            className="algo-card"
            onClick={() => setActiveAlgorithm(algo)}
            aria-label={`View details for ${algo.name}`}
          >
            <div className="algo-card-inner">
              <div className="algo-card-top">
                <span className="algo-card-category">{algo.category.replace(' Algorithms', '')}</span>
                <span className="algo-card-chip">{algo.complexity.time}</span>
              </div>
              <h3 className="algo-card-title">{algo.name}</h3>
              <div className="algo-card-bottom">
                <span className="algo-card-space">Space {algo.complexity.space}</span>
                <span className="algo-card-prompt">View Details →</span>
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

      {/* Detail Modal View */}
      {activeAlgorithm && (
        <div className="algo-modal-overlay" onClick={() => setActiveAlgorithm(null)} role="dialog" aria-modal="true">
          <div className="algo-modal-content" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="algo-modal-header">
              <div>
                <span className="algo-modal-category">{activeAlgorithm.category}</span>
                <h2 className="algo-modal-title">{activeAlgorithm.name}</h2>
              </div>
              <div className="algo-modal-actions">
                <div className="algo-complexity-pills">
                  <span className="pill time"><Clock size={12} /> {activeAlgorithm.complexity.time}</span>
                  <span className="pill space"><Database size={12} /> {activeAlgorithm.complexity.space}</span>
                </div>
                <button
                  className="algo-modal-close"
                  onClick={() => setActiveAlgorithm(null)}
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body with 4 Mandatory Sections */}
            <div className="algo-modal-body">
              {/* Section 1: Explanation */}
              <div className="algo-section">
                <div className="algo-section-heading">
                  <BookOpen size={16} />
                  <h4>1. Explanation & Complexity</h4>
                </div>
                <p className="algo-text">{activeAlgorithm.explanation}</p>
                <div className="algo-complexity-box">
                  <div>
                    <strong>Time Complexity:</strong> <code>{activeAlgorithm.complexity.time}</code>
                  </div>
                  <div>
                    <strong>Space Complexity:</strong> <code>{activeAlgorithm.complexity.space}</code>
                  </div>
                </div>
              </div>

              {/* Section 2: Real-World Example */}
              <div className="algo-section">
                <div className="algo-section-heading">
                  <Sparkles size={16} />
                  <h4>2. Real-World Analogy</h4>
                </div>
                <div className="algo-analogy-box">
                  <p>{activeAlgorithm.realWorldExample}</p>
                </div>
              </div>

              {/* Section 3: Step-by-Step Logic */}
              <div className="algo-section">
                <div className="algo-section-heading">
                  <Layers size={16} />
                  <h4>3. Step-by-Step Logic</h4>
                </div>
                <ol className="algo-steps-list">
                  {activeAlgorithm.stepByStepLogic.map((step, idx) => (
                    <li key={idx}>{step.replace(/^\d+\.\s*/, '')}</li>
                  ))}
                </ol>
              </div>

              {/* Section 4: Executable Python Code */}
              <div className="algo-section">
                <div className="algo-section-heading code-heading">
                  <div>
                    <span className="code-tag">PYTHON</span>
                    <h4>4. Executable Python Code</h4>
                  </div>
                  <div className="code-action-buttons">
                    <button
                      className="copy-btn"
                      onClick={() => handleCopy(activeAlgorithm.pythonCode)}
                      aria-label="Copy python code"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      className="load-editor-btn"
                      onClick={() => handleLoad(activeAlgorithm.pythonCode)}
                      aria-label="Load code into ChronoNode visualizer editor"
                    >
                      <Play size={14} /> Load into Editor
                    </button>
                  </div>
                </div>
                <pre className="algo-code-block">
                  <code>{activeAlgorithm.pythonCode}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
