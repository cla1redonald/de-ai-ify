// TODO(@engineer): Implement <ResultsPanel />.
//
// Props:
//   result: ScoreResult
//   onRewrite: () => void
//   onReset: () => void
//   rewritesRemaining: number
//
// Layout (see docs/design.md §"State 2 — Results"):
//   [← "Score something else" back link — calls onReset]
//   [<ScoreHero score={result.score} animateIn={true} />]
//   [<VerdictCopy text={result.verdictCopy} />]
//   [<PatternBreakdown patterns={result.patterns} />]
//   [<AnnotatedText text={result.originalText} highlights={result.highlights} defaultCollapsed on mobile />]
//   [<RewriteButton onClick={onRewrite} rewritesRemaining={rewritesRemaining} /> — only if patterns found]
//
// See docs/design.md §"<ResultsPanel />".

"use client";

import type { ScoreResult } from "@/lib/types";

interface ResultsPanelProps {
  result: ScoreResult;
  onRewrite: () => void;
  onReset: () => void;
  rewritesRemaining: number;
}

export default function ResultsPanel({
  result: _result,
  onRewrite: _onRewrite,
  onReset: _onReset,
  rewritesRemaining: _rewritesRemaining,
}: ResultsPanelProps) {
  // TODO: implement
  return (
    <div className="space-y-8">
      <p className="text-text-secondary text-sm font-mono">// ResultsPanel — TODO</p>
    </div>
  );
}
