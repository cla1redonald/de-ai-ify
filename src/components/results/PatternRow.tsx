// TODO(@engineer): Implement <PatternRow />.
//
// Props:
//   pattern: PatternResult   // { category, count, severity, instances: string[] }
//   defaultOpen?: boolean
//
// Layout:
//   [Category badge] [Count pill] [Severity dot] [Expand chevron →]
//   └── Expanded: list of instances in font-mono text-xs (15 words of context each)
//
// Styles:
//   Category badge: bg-bg-raised text-text-secondary text-xs font-medium px-2 py-0.5 rounded
//   Count pill:     bg-score-{severity}/20 text-score-{severity} text-xs px-2 py-0.5 rounded-full
//   Expand/collapse: max-h transition — max-h-0 → max-h-96 overflow-hidden transition-all duration-200
//
// Severity → colour mapping:
//   low    → score-green
//   medium → score-amber
//   high   → score-red
//
// See docs/design.md §"Pattern breakdown" and §"<PatternRow />".

"use client";

import { useState } from "react";
import type { PatternResult } from "@/lib/types";

interface PatternRowProps {
  pattern: PatternResult;
  defaultOpen?: boolean;
}

export default function PatternRow({ pattern, defaultOpen = false }: PatternRowProps) {
  const [open, setOpen] = useState(defaultOpen);
  // TODO: implement full expand/collapse with correct severity colours
  return (
    <div className="border border-border-subtle rounded p-3">
      <button
        className="w-full flex items-center justify-between"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-xs font-medium text-text-secondary bg-bg-raised px-2 py-0.5 rounded">
          {pattern.category}
        </span>
        <span className="text-xs text-text-tertiary">{pattern.count} instances</span>
      </button>
      {/* TODO: expand panel with instances */}
    </div>
  );
}
