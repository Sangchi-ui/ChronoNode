import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  ExternalLink,
  Layers,
  Lightbulb,
  Play,
} from 'lucide-react';
import type { AlgorithmData } from './data/algorithms';
import { getEnrichedAlgorithm, type EnrichedAlgorithmData } from './data/algorithms/enrichment';
import { EmbeddedVisualizer } from './EmbeddedVisualizer';

interface AlgorithmDetailPageProps {
  algorithm: AlgorithmData;
  onBack: () => void;
  onLoadIntoWorkspace?: (code: string) => void;
}

export function AlgorithmDetailPage({
  algorithm,
  onBack,
  onLoadIntoWorkspace,
}: AlgorithmDetailPageProps) {
  const [enriched, setEnriched] = useState<EnrichedAlgorithmData>(() =>
    getEnrichedAlgorithm(algorithm)
  );

  useEffect(() => {
    setEnriched(getEnrichedAlgorithm(algorithm));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [algorithm]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="algo-detail-page w-full min-h-screen">
      {/* Top Sticky Navigation Bar */}
      <nav className="detail-top-nav w-full">
        <div className="detail-nav-left">
          <button className="back-btn" onClick={onBack} aria-label="Back to Algorithms list">
            <ArrowLeft size={16} />
            <span>Back to Algorithms</span>
          </button>
          <div className="detail-breadcrumbs">
            <span>Algorithms</span>
            <span className="sep">/</span>
            <span>{enriched.category}</span>
            <span className="sep">/</span>
            <span className="current-crumb">{enriched.name}</span>
          </div>
        </div>

        <div className="detail-nav-links">
          <button onClick={() => scrollToSection('sec-explanation')}>Explanation</button>
          <button onClick={() => scrollToSection('sec-walkthrough')}>Walkthrough</button>
          <button onClick={() => scrollToSection('sec-complexity')}>Complexity</button>
          <button onClick={() => scrollToSection('sec-logic')}>Logic</button>
          <button onClick={() => scrollToSection('sec-visualizer')} className="nav-highlight">
            <Play size={13} /> Visualizer
          </button>
        </div>

        <div className="detail-nav-right">
          {onLoadIntoWorkspace && (
            <button
              className="workspace-link-btn"
              onClick={() => onLoadIntoWorkspace(enriched.pythonCode)}
              title="Open this algorithm in the main ChronoNode Workspace"
            >
              <ExternalLink size={14} />
              <span>Open in Main Editor</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Educational Article Content - Comfortable Reading Width (max-w-7xl mx-auto px-8) */}
      <div className="detail-content-container max-w-7xl mx-auto px-8 w-full">
        {/* Hero Header */}
        <header className="detail-hero">
          <div className="hero-category-badge">{enriched.category}</div>
          <h1 className="hero-title">{enriched.name}</h1>
          <div className="hero-subtitle prose prose-invert prose-green max-w-none">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {enriched.explanation}
            </ReactMarkdown>
          </div>

          <div className="hero-metrics-bar">
            <div className="metric-pill">
              <Clock size={15} className="metric-icon" />
              <div className="metric-text">
                <span className="metric-label">Time Complexity</span>
                <span className="metric-value">{enriched.complexity.time}</span>
              </div>
            </div>

            <div className="metric-pill">
              <Cpu size={15} className="metric-icon" />
              <div className="metric-text">
                <span className="metric-label">Space Complexity</span>
                <span className="metric-value">{enriched.complexity.space}</span>
              </div>
            </div>

            <div className="metric-pill">
              <Layers size={15} className="metric-icon" />
              <div className="metric-text">
                <span className="metric-label">Category</span>
                <span className="metric-value">{enriched.category.replace(' Algorithms', '')}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Section 1: In-Depth Explanation & Intuition */}
        <section id="sec-explanation" className="detail-section">
          <div className="section-title-wrap">
            <span className="section-number">01</span>
            <h2>In-Depth Explanation & Behavioral Mechanics</h2>
          </div>
          <div className="section-body tutorial-prose">
            <div className="lead-paragraph markdown-content prose prose-invert prose-green max-w-none">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {enriched.inDepthExplanation}
              </ReactMarkdown>
            </div>

            <div className="analogy-callout">
              <div className="callout-header">
                <Lightbulb size={18} className="callout-icon" />
                <h3>Real-World Analogy</h3>
              </div>
              <div className="prose prose-invert prose-green max-w-none">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {enriched.realWorldExample}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Concrete Step-by-Step Visual Walkthrough */}
        <section id="sec-walkthrough" className="detail-section">
          <div className="section-title-wrap">
            <span className="section-number">02</span>
            <h2>Visual Breakdown & Concrete Walkthrough</h2>
          </div>
          <div className="section-body">
            <p className="walkthrough-intro">
              Let us trace through an exact concrete execution instance with input:{' '}
              <code>{enriched.concreteWalkthrough.inputExample}</code>
            </p>

            {enriched.concreteWalkthrough.initialState && (
              <div className="walkthrough-initial-badge">
                <span className="badge-title">INITIAL STATE:</span>
                <code>{enriched.concreteWalkthrough.initialState}</code>
              </div>
            )}

            <div className="walkthrough-steps-list">
              {enriched.concreteWalkthrough.steps.map((st) => (
                <div className="walkthrough-step-card" key={st.step}>
                  <div className="step-badge">Phase {st.step}</div>
                  <div className="step-content">
                    <h4 className="step-action">{st.action}</h4>
                    <div className="step-state-display">
                      <span className="state-label">State:</span>
                      <code>{st.state}</code>
                    </div>
                    <div className="step-explanation prose prose-invert prose-green max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {st.explanation}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {enriched.concreteWalkthrough.finalState && (
              <div className="walkthrough-final-badge">
                <CheckCircle2 size={16} className="success-icon" />
                <div>
                  <span className="badge-title">TERMINATION / FINAL STATE:</span>
                  <div className="prose prose-invert prose-green max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {enriched.concreteWalkthrough.finalState}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {enriched.concreteWalkthrough.summary && (
              <div className="walkthrough-summary prose prose-invert prose-green max-w-none">
                <b>Summary:</b>{' '}
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {enriched.concreteWalkthrough.summary}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Rigorous Complexity Analysis */}
        <section id="sec-complexity" className="detail-section">
          <div className="section-title-wrap">
            <span className="section-number">03</span>
            <h2>Complexity Analysis & Mathematical Bounds</h2>
          </div>
          <div className="section-body">
            <div className="complexity-grid">
              <div className="complexity-card">
                <span className="comp-case">BEST CASE</span>
                <span className="comp-badge best">{enriched.complexity.best || enriched.complexity.time}</span>
                <small>Optimal input scenario</small>
              </div>
              <div className="complexity-card">
                <span className="comp-case">AVERAGE CASE</span>
                <span className="comp-badge average">{enriched.complexity.average || enriched.complexity.time}</span>
                <small>Expected distribution</small>
              </div>
              <div className="complexity-card">
                <span className="comp-case">WORST CASE</span>
                <span className="comp-badge worst">{enriched.complexity.worst || enriched.complexity.time}</span>
                <small>Adversarial input scenario</small>
              </div>
              <div className="complexity-card">
                <span className="comp-case">AUXILIARY SPACE</span>
                <span className="comp-badge space">{enriched.complexity.space}</span>
                <small>Additional memory allocated</small>
              </div>
            </div>

            <div className="complexity-derivation-box prose prose-invert prose-green max-w-none">
              <h4>Derivation & Asymptotic Invariants</h4>
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {enriched.complexity.breakdownExplanation}
              </ReactMarkdown>
            </div>
          </div>
        </section>

        {/* Section 4: Step-by-Step Logic */}
        <section id="sec-logic" className="detail-section">
          <div className="section-title-wrap">
            <span className="section-number">04</span>
            <h2>Algorithmic Procedure & Pseudocode Breakdown</h2>
          </div>
          <div className="section-body">
            <ol className="ordered-steps-list">
              {enriched.stepByStepLogic.map((step, idx) => (
                <li key={idx}>
                  <div className="step-num">{idx + 1}</div>
                  <div className="step-text prose prose-invert prose-green max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {step}
                    </ReactMarkdown>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Section 5: Real-World Applications & Edge Cases */}
        <section className="detail-section">
          <div className="section-title-wrap">
            <span className="section-number">05</span>
            <h2>Applications, Edge Cases & Trade-offs</h2>
          </div>
          <div className="section-body dual-column-wrap">
            <div className="tutorial-col">
              <h3>Key Real-World Applications</h3>
              <ul className="bulleted-list">
                {enriched.applications.map((app, i) => (
                  <li key={i}>
                    <div className="prose prose-invert prose-green max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {app}
                      </ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="tutorial-col">
              <h3>Critical Edge Cases to Consider</h3>
              <ul className="bulleted-list">
                {enriched.edgeCases.map((edge, i) => (
                  <li key={i}>
                    <div className="prose prose-invert prose-green max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {edge}
                      </ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Section 6: Edge-to-Edge Bottom Execution Environment (Full Viewport Width 100%) */}
      <section id="sec-visualizer" className="execution-environment-section w-full max-w-none">
        <div className="section-title-wrap max-w-7xl mx-auto px-8 mb-6">
          <span className="section-number">06</span>
          <div>
            <h2>Interactive Execution & Visualizer</h2>
            <p className="section-subtext">
              Run, edit, and step through {enriched.name} in Python directly below. Watch the data
              structures update in real-time on the right canvas.
            </p>
          </div>
        </div>

        <div className="embedded-visualizer-outer w-full max-w-none">
          <EmbeddedVisualizer
            initialCode={enriched.pythonCode}
            title={`${enriched.name} Execution Trace`}
          />
        </div>
      </section>
    </div>
  );
}
