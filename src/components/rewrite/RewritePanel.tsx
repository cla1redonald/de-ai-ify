"use client";

import { useState } from "react";
import TextPane from "@/components/rewrite/TextPane";
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

      {/* Desktop: two-column */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        <TextPane label="Original" text={original} muted={true} />
        <div className="space-y-3">
          <TextPane label="Rewritten" text={rewritten} />
          <CopyButton text={rewritten} />
        </div>
      </div>

      {/* Mobile: stacked, original behind disclosure */}
      <div className="lg:hidden space-y-4">
        <TextPane label="Rewritten" text={rewritten} />
        <CopyButton text={rewritten} />

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

      {/* Re-score CTA */}
      <p className="text-center text-text-tertiary text-xs">
        Want to check the rewrite?{" "}
        <button onClick={onReset} className="text-accent hover:underline">
          Paste it back in.
        </button>
      </p>
    </div>
  );
}
