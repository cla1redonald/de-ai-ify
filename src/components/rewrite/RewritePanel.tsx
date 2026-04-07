"use client";

import { useState } from "react";
import TextPane from "@/components/rewrite/TextPane";
import DiffView from "@/components/rewrite/DiffView";
import CopyButton from "@/components/rewrite/CopyButton";

interface RewritePanelProps {
  original: string;
  rewritten: string;
  onBack: () => void;
  onReset: () => void;
}

export default function RewritePanel({
  original,
  rewritten,
  onBack,
  onReset,
}: RewritePanelProps) {
  const [showDiff, setShowDiff] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back link */}
      <button
        onClick={onBack}
        className="text-text-tertiary hover:text-text-secondary text-sm transition-colors group flex items-center gap-1.5"
      >
        <span className="inline-block transition-transform group-hover:-translate-x-0.5">&larr;</span>
        Back to results
      </button>

      {/* View toggle */}
      <div className="flex gap-4 border-b border-border-subtle">
        <button
          onClick={() => setShowDiff(true)}
          className={`pb-2 text-sm font-medium -mb-px transition-colors ${
            showDiff
              ? "text-accent border-b-2 border-accent"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Changes
        </button>
        <button
          onClick={() => setShowDiff(false)}
          className={`pb-2 text-sm font-medium -mb-px transition-colors ${
            !showDiff
              ? "text-accent border-b-2 border-accent"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Clean
        </button>
      </div>

      {/* Diff view */}
      {showDiff ? (
        <div className="space-y-3">
          <p className="text-xs tracking-widest uppercase text-text-secondary font-medium">
            What changed
          </p>
          <DiffView original={original} rewritten={rewritten} />
          <div className="flex items-center gap-4 text-xs text-text-tertiary">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-score-green/15 border border-score-green/30" />
              Added
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-score-red/15 border border-score-red/30" />
              Removed
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop: two-column */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-6">
            <TextPane label="Original" text={original} muted={true} />
            <TextPane label="Rewritten" text={rewritten} />
          </div>

          {/* Mobile: stacked, original behind disclosure */}
          <div className="lg:hidden space-y-4">
            <TextPane label="Rewritten" text={rewritten} />

            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="text-text-tertiary hover:text-text-secondary text-xs transition-colors flex items-center gap-1.5"
            >
              <span
                className={`transition-transform duration-200 ${showOriginal ? "rotate-90" : ""}`}
                aria-hidden="true"
              >
                &#9656;
              </span>
              {showOriginal ? "Hide original" : "Show original"}
            </button>

            <div
              className={`overflow-hidden transition-all duration-200 ${
                showOriginal ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <TextPane label="Original" text={original} muted={true} />
            </div>
          </div>
        </div>
      )}

      {/* Copy + re-score */}
      <CopyButton text={rewritten} />

      <p className="text-center text-text-tertiary text-xs">
        Want to check the rewrite?{" "}
        <button onClick={onReset} className="text-accent hover:underline">
          Paste it back in.
        </button>
      </p>
    </div>
  );
}
