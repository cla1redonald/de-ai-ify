"use client";

import type { ScoreResult } from "@/lib/types";
import ScoreHero from "@/components/results/ScoreHero";
import VerdictCopy from "@/components/results/VerdictCopy";
import PatternBreakdown from "@/components/results/PatternBreakdown";
import AnnotatedText from "@/components/results/AnnotatedText";
import RewriteButton from "@/components/results/RewriteButton";

interface ResultsPanelProps {
  result: ScoreResult;
  onRewrite: () => void;
  onReset: () => void;
  rewritesRemaining: number;
  isRewriting: boolean;
}

export default function ResultsPanel({
  result,
  onRewrite,
  onReset,
  rewritesRemaining,
  isRewriting,
}: ResultsPanelProps) {
  const hasPatterns = result.patterns.length > 0;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Back link */}
      <button
        onClick={onReset}
        className="text-text-tertiary hover:text-text-secondary text-sm transition-colors group flex items-center gap-1.5"
      >
        <span className="inline-block transition-transform group-hover:-translate-x-0.5">&larr;</span>
        Score something else
      </button>

      {/* Score */}
      <ScoreHero score={result.score} animateIn={true} />

      {/* Verdict */}
      <VerdictCopy text={result.verdictCopy} />

      {/* Pattern breakdown */}
      {hasPatterns && <PatternBreakdown patterns={result.patterns} />}

      {/* Annotated text */}
      {result.highlights.length > 0 && (
        <AnnotatedText
          text={result.originalText}
          highlights={result.highlights}
          defaultCollapsed={true}
        />
      )}

      {/* Rewrite CTA */}
      {hasPatterns && (
        <RewriteButton
          onClick={onRewrite}
          isLoading={isRewriting}
          rewritesRemaining={rewritesRemaining}
          disabled={rewritesRemaining <= 0}
        />
      )}
    </div>
  );
}
