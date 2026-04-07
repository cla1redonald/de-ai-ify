"use client";

import { useMemo } from "react";
import { computeDiff } from "@/lib/diff";

interface DiffViewProps {
  original: string;
  rewritten: string;
}

export default function DiffView({ original, rewritten }: DiffViewProps) {
  const segments = useMemo(() => computeDiff(original, rewritten), [original, rewritten]);

  return (
    <div className="bg-bg-surface rounded p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
      {segments.map((seg, i) => {
        if (seg.type === "same") {
          return <span key={i} className="text-text-mono">{seg.text}</span>;
        }
        if (seg.type === "added") {
          return (
            <span key={i} className="bg-score-green/15 text-score-green rounded-sm px-0.5">
              {seg.text}
            </span>
          );
        }
        // removed
        return (
          <span key={i} className="bg-score-red/15 text-score-red line-through rounded-sm px-0.5 opacity-60">
            {seg.text}
          </span>
        );
      })}
    </div>
  );
}
