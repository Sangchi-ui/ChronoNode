import React from 'react';
import { X, Sparkles, AlertTriangle, ArrowRight, Database } from 'lucide-react';
import { ALL_EDGE_CASES, type EdgeCaseDataset } from './data/edgeCases';

interface EdgeCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDataset: (pythonCode: string, name: string) => void;
}

export function EdgeCaseModal({ isOpen, onClose, onSelectDataset }: EdgeCaseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="edge-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="edge-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edge-modal-header">
          <div className="edge-modal-title-group">
            <span className="edge-badge">
              <Sparkles size={12} /> SMART DATASETS
            </span>
            <h3>Edge-Case Data Generators</h3>
          </div>
          <button className="edge-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <p className="edge-modal-subtitle">
          Instantly load stress-testing datasets into the ChronoNode Python visualizer to observe
          asymptotic breakdowns and edge-case behavior.
        </p>

        <div className="edge-cards-grid">
          {ALL_EDGE_CASES.map((dataset) => (
            <div className="edge-dataset-card" key={dataset.id}>
              <div className="dataset-top">
                <span className="dataset-category">{dataset.category.toUpperCase()}</span>
                <button
                  className="load-dataset-btn"
                  onClick={() => {
                    onSelectDataset(dataset.pythonSnippet, dataset.name);
                    onClose();
                  }}
                >
                  Load Dataset <ArrowRight size={13} />
                </button>
              </div>

              <h4 className="dataset-title">{dataset.name}</h4>
              <p className="dataset-desc">{dataset.description}</p>

              <div className="adversarial-box">
                <div className="adv-head">
                  <AlertTriangle size={13} className="adv-icon" />
                  <span>Why It Matters:</span>
                </div>
                <p>{dataset.adversarialReason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
