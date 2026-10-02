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

export interface AlgorithmPageLayoutProps {
  algorithm: AlgorithmData;
  onBack: () => void;
  onLoadIntoWorkspace?: (code: string) => void;
}

export function TopBar({
  onBack,
  onLoadIntoWorkspace,
  pythonCode,
  category,
  name,
}: {
  onBack: () => void;
  onLoadIntoWorkspace?: (code: string) => void;
  pythonCode: string;
  category: string;
  name: string;
}) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="detail-top-nav w-full bg-slate-900/90 backdrop-blur border-b border-slate-800">
      <div className="detail-nav-left flex items-center gap-4">
        <button
          className="back-btn flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          onClick={onBack}
          aria-label="Back to Algorithms list"
        >
          <ArrowLeft size={16} />
          <span>Back to Algorithms</span>
        </button>
        <div className="detail-breadcrumbs hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span>Algorithms</span>
          <span className="sep text-slate-600">/</span>
          <span>{category}</span>
          <span className="sep text-slate-600">/</span>
          <span className="current-crumb text-lime-400 font-semibold">{name}</span>
        </div>
      </div>

      <div className="detail-nav-links hidden md:flex items-center gap-3 text-xs">
        <button onClick={() => scrollToSection('sec-explanation')} className="hover:text-lime-300">
          Explanation
        </button>
        <button onClick={() => scrollToSection('sec-complexity')} className="hover:text-lime-300">
          Complexity
        </button>
        <button onClick={() => scrollToSection('sec-walkthrough')} className="hover:text-lime-300">
          Walkthrough
        </button>
        <button onClick={() => scrollToSection('sec-logic')} className="hover:text-lime-300">
          Logic
        </button>
        <button
          onClick={() => scrollToSection('sec-visualizer')}
          className="nav-highlight flex items-center gap-1.5 px-3 py-1.5 bg-lime-400/10 text-lime-400 border border-lime-400/30 rounded-md font-semibold hover:bg-lime-400/20"
        >
          <Play size={13} /> Visualizer
        </button>
      </div>

      <div className="detail-nav-right flex items-center gap-3">
        {onLoadIntoWorkspace && (
          <button
            className="workspace-link-btn flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-all"
            onClick={() => onLoadIntoWorkspace(pythonCode)}
            title="Open this algorithm in the main ChronoNode Workspace"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Open in Main Editor</span>
          </button>
        )}
      </div>
    </nav>
  );
}

export function ReadingSection({ enriched }: { enriched: EnrichedAlgorithmData }) {
  return (
    <div className="reading-section detail-content-container w-full max-w-[1600px] mx-auto px-6 lg:px-10 flex flex-col gap-10 py-10">
      {/* Hero Header */}
      <header className="detail-hero flex flex-col gap-4">
        <div className="hero-category-badge self-start bg-lime-950/60 text-lime-400 border border-lime-800/60 font-mono font-bold text-xs px-2.5 py-1 rounded tracking-wider uppercase">
          {enriched.category}
        </div>
        <h1 className="hero-title text-3xl sm:text-4xl font-extrabold text-white tracking-tight m-0">
          {enriched.name}
        </h1>
        <div className="hero-subtitle prose prose-invert prose-green max-w-none text-slate-300 text-base leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {enriched.explanation}
          </ReactMarkdown>
        </div>

        <div className="hero-metrics-bar grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          <div className="metric-pill flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-3 rounded-lg">
            <Clock size={16} className="metric-icon text-lime-400 shrink-0" />
            <div className="metric-text flex flex-col">
              <span className="metric-label text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Time Complexity
              </span>
              <span className="metric-value font-mono font-bold text-sm text-slate-100">
                {enriched.complexity.time}
              </span>
            </div>
          </div>

          <div className="metric-pill flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-3 rounded-lg">
            <Cpu size={16} className="metric-icon text-lime-400 shrink-0" />
            <div className="metric-text flex flex-col">
              <span className="metric-label text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Space Complexity
              </span>
              <span className="metric-value font-mono font-bold text-sm text-slate-100">
                {enriched.complexity.space}
              </span>
            </div>
          </div>

          <div className="metric-pill flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-3 rounded-lg">
            <Layers size={16} className="metric-icon text-lime-400 shrink-0" />
            <div className="metric-text flex flex-col">
              <span className="metric-label text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Category
              </span>
              <span className="metric-value font-mono font-bold text-sm text-slate-100">
                {enriched.category.replace(' Algorithms', '')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Side-by-Side Responsive Grid on XL Screens: Explanation + Complexity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start w-full">
        {/* Section 1: In-Depth Explanation & Intuition */}
        <section id="sec-explanation" className="detail-section h-full flex flex-col gap-6">
          <div className="section-title-wrap flex items-center gap-3 pb-3 border-b border-slate-800">
            <span className="section-number text-xs font-mono font-bold text-lime-400 bg-lime-950/60 border border-lime-800/60 px-2 py-0.5 rounded">
              01
            </span>
            <h2 className="text-lg font-bold text-slate-100 m-0">
              In-Depth Explanation & Behavioral Mechanics
            </h2>
          </div>
          <div className="section-body tutorial-prose flex flex-col gap-4">
            <div className="lead-paragraph markdown-content prose prose-invert prose-green max-w-none">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {enriched.inDepthExplanation}
              </ReactMarkdown>
            </div>

            <div className="analogy-callout bg-emerald-950/30 border border-emerald-800/40 border-l-4 border-l-lime-400 rounded-lg p-5">
              <div className="callout-header flex items-center gap-2 text-lime-400 font-bold mb-2">
                <Lightbulb size={18} className="callout-icon" />
                <h3 className="text-sm font-bold text-lime-300 m-0">Real-World Analogy</h3>
              </div>
              <div className="prose prose-invert prose-green max-w-none text-emerald-100 text-sm leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {enriched.realWorldExample}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 (Complexity): Rigorous Complexity Analysis */}
        <section id="sec-complexity" className="detail-section h-full flex flex-col gap-6">
          <div className="section-title-wrap flex items-center gap-3 pb-3 border-b border-slate-800">
            <span className="section-number text-xs font-mono font-bold text-lime-400 bg-lime-950/60 border border-lime-800/60 px-2 py-0.5 rounded">
              02
            </span>
            <h2 className="text-lg font-bold text-slate-100 m-0">
              Complexity Analysis & Mathematical Bounds
            </h2>
          </div>
          <div className="section-body flex flex-col gap-5">
            <div className="complexity-grid grid grid-cols-2 gap-3.5">
              <div className="complexity-card bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col items-center gap-1.5 text-center">
                <span className="comp-case text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                  BEST CASE
                </span>
                <span className="comp-badge best text-lg font-mono font-extrabold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-0.5 rounded">
                  {enriched.complexity.best || enriched.complexity.time}
                </span>
                <small className="text-xs text-slate-500">Optimal input scenario</small>
              </div>

              <div className="complexity-card bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col items-center gap-1.5 text-center">
                <span className="comp-case text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                  AVERAGE CASE
                </span>
                <span className="comp-badge average text-lg font-mono font-extrabold text-lime-400 bg-lime-950/50 border border-lime-800/60 px-2.5 py-0.5 rounded">
                  {enriched.complexity.average || enriched.complexity.time}
                </span>
                <small className="text-xs text-slate-500">Expected distribution</small>
              </div>

              <div className="complexity-card bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col items-center gap-1.5 text-center">
                <span className="comp-case text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                  WORST CASE
                </span>
                <span className="comp-badge worst text-lg font-mono font-extrabold text-orange-400 bg-orange-950/50 border border-orange-800/60 px-2.5 py-0.5 rounded">
                  {enriched.complexity.worst || enriched.complexity.time}
                </span>
                <small className="text-xs text-slate-500">Adversarial input scenario</small>
              </div>

              <div className="complexity-card bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col items-center gap-1.5 text-center">
                <span className="comp-case text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                  AUXILIARY SPACE
                </span>
                <span className="comp-badge space text-lg font-mono font-extrabold text-sky-400 bg-sky-950/50 border border-sky-800/60 px-2.5 py-0.5 rounded">
                  {enriched.complexity.space}
                </span>
                <small className="text-xs text-slate-500">Additional memory allocated</small>
              </div>
            </div>

            <div className="complexity-derivation-box bg-slate-900/70 border border-slate-800 rounded-lg p-5 prose prose-invert prose-green max-w-none">
              <h4 className="text-sm font-bold text-slate-200 mt-0 mb-2">
                Derivation & Asymptotic Invariants
              </h4>
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {enriched.complexity.breakdownExplanation}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      </div>

      {/* Section 3: Concrete Step-by-Step Visual Walkthrough (Responsive 2-Col Grid) */}
      <section id="sec-walkthrough" className="detail-section flex flex-col gap-6">
        <div className="section-title-wrap flex items-center gap-3 pb-3 border-b border-slate-800">
          <span className="section-number text-xs font-mono font-bold text-lime-400 bg-lime-950/60 border border-lime-800/60 px-2 py-0.5 rounded">
            03
          </span>
          <h2 className="text-lg font-bold text-slate-100 m-0">
            Visual Breakdown & Concrete Walkthrough
          </h2>
        </div>

        <div className="section-body flex flex-col gap-6">
          <div className="walkthrough-meta flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <p className="walkthrough-intro text-sm text-slate-400 m-0">
              Tracing input instance:{' '}
              <code className="bg-slate-900 border border-slate-800 text-lime-300 font-mono text-xs px-2 py-1 rounded">
                {enriched.concreteWalkthrough.inputExample}
              </code>
            </p>

            {enriched.concreteWalkthrough.initialState && (
              <div className="walkthrough-initial-badge flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-xs">
                <span className="badge-title font-mono font-bold text-slate-400">INITIAL STATE:</span>
                <code className="text-sky-300 font-mono">{enriched.concreteWalkthrough.initialState}</code>
              </div>
            )}
          </div>

          {/* 2-Column Responsive Grid for Walkthrough Steps */}
          <div className="walkthrough-steps-list grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {enriched.concreteWalkthrough.steps.map((st) => (
              <div
                className="walkthrough-step-card bg-slate-900 border border-slate-800/80 rounded-lg p-5 flex gap-4 items-start overflow-hidden hover:border-slate-700 transition-colors"
                key={st.step}
              >
                <div className="step-badge bg-slate-800 border border-slate-700 text-lime-400 font-mono font-bold text-xs px-2.5 py-1 rounded shrink-0">
                  Phase {st.step}
                </div>
                <div className="step-content flex flex-col gap-2 min-w-0 flex-1">
                  <h4 className="step-action text-sm font-bold text-slate-200 m-0">{st.action}</h4>
                  <div className="step-state-display flex items-center gap-2 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-xs overflow-x-auto max-w-full">
                    <span className="state-label text-slate-500 font-mono font-semibold">State:</span>
                    <code className="text-sky-300 font-mono whitespace-nowrap">{st.state}</code>
                  </div>
                  <div className="step-explanation prose prose-invert prose-green max-w-none text-xs text-slate-400 leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {st.explanation}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {enriched.concreteWalkthrough.finalState && (
            <div className="walkthrough-final-badge flex items-center gap-3 bg-emerald-950/40 border border-emerald-800/50 rounded-lg p-4">
              <CheckCircle2 size={18} className="success-icon text-lime-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="badge-title text-xs font-mono font-bold text-lime-400 block mb-1">
                  TERMINATION / FINAL STATE:
                </span>
                <div className="prose prose-invert prose-green max-w-none text-sm text-slate-200">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {enriched.concreteWalkthrough.finalState}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {enriched.concreteWalkthrough.summary && (
            <div className="walkthrough-summary bg-slate-900 border border-slate-800 rounded-lg p-4 prose prose-invert prose-green max-w-none text-sm text-slate-300">
              <strong className="text-white">Summary:</strong>{' '}
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {enriched.concreteWalkthrough.summary}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: Step-by-Step Logic Breakdown */}
      <section id="sec-logic" className="detail-section flex flex-col gap-6">
        <div className="section-title-wrap flex items-center gap-3 pb-3 border-b border-slate-800">
          <span className="section-number text-xs font-mono font-bold text-lime-400 bg-lime-950/60 border border-lime-800/60 px-2 py-0.5 rounded">
            04
          </span>
          <h2 className="text-lg font-bold text-slate-100 m-0">
            Algorithmic Procedure & Pseudocode Breakdown
          </h2>
        </div>
        <div className="section-body">
          <ol className="ordered-steps-list grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
            {enriched.stepByStepLogic.map((step, idx) => (
              <li
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-start gap-3.5"
              >
                <div className="step-num w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-lime-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="step-text prose prose-invert prose-green max-w-none text-sm text-slate-300 leading-relaxed flex-1">
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
      <section id="sec-applications" className="detail-section flex flex-col gap-6">
        <div className="section-title-wrap flex items-center gap-3 pb-3 border-b border-slate-800">
          <span className="section-number text-xs font-mono font-bold text-lime-400 bg-lime-950/60 border border-lime-800/60 px-2 py-0.5 rounded">
            05
          </span>
          <h2 className="text-lg font-bold text-slate-100 m-0">
            Applications, Edge Cases & Trade-offs
          </h2>
        </div>
        <div className="section-body grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="tutorial-col bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-bold text-slate-100 mt-0 mb-3.5">
              Key Real-World Applications
            </h3>
            <ul className="bulleted-list flex flex-col gap-3 pl-4 m-0">
              {enriched.applications.map((app, i) => (
                <li key={i} className="text-sm text-slate-300">
                  <div className="prose prose-invert prose-green max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {app}
                    </ReactMarkdown>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="tutorial-col bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-bold text-slate-100 mt-0 mb-3.5">
              Critical Edge Cases to Consider
            </h3>
            <ul className="bulleted-list flex flex-col gap-3 pl-4 m-0">
              {enriched.edgeCases.map((edge, i) => (
                <li key={i} className="text-sm text-slate-300">
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
  );
}

export function ExecutionSection({ enriched }: { enriched: EnrichedAlgorithmData }) {
  return (
    <section
      id="sec-visualizer"
      className="execution-section execution-environment-section w-full border-t border-slate-800"
    >
      <div className="execution-header-bar w-full max-w-[1600px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="section-number text-xs font-mono font-bold text-lime-400 bg-lime-950/60 border border-lime-800/60 px-2 py-0.5 rounded">
            06
          </span>
          <h2 className="text-base font-bold text-slate-100 m-0">
            Interactive Execution & Visualizer
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">— {enriched.name}</span>
        </div>
      </div>

      <div className="embedded-visualizer-outer w-full">
        <EmbeddedVisualizer
          initialCode={enriched.pythonCode}
          title={`${enriched.name} Execution Trace`}
        />
      </div>
    </section>
  );
}

export function AlgorithmPageLayout({
  algorithm,
  onBack,
  onLoadIntoWorkspace,
}: AlgorithmPageLayoutProps) {
  const [enriched, setEnriched] = useState<EnrichedAlgorithmData>(() =>
    getEnrichedAlgorithm(algorithm)
  );

  useEffect(() => {
    setEnriched(getEnrichedAlgorithm(algorithm));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [algorithm]);

  return (
    <main className="w-full min-h-screen bg-slate-950">
      <TopBar
        onBack={onBack}
        onLoadIntoWorkspace={onLoadIntoWorkspace}
        pythonCode={enriched.pythonCode}
        category={enriched.category}
        name={enriched.name}
      />
      <ReadingSection enriched={enriched} />
      <ExecutionSection enriched={enriched} />
    </main>
  );
}
