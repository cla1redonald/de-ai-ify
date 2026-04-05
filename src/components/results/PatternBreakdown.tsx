// TODO(@engineer): Implement <PatternBreakdown />.
//
// Props:
//   patterns: PatternResult[]
//
// Renders a <PatternRow /> for each detected category (skip categories with count === 0).
//
// See docs/design.md §"Pattern breakdown".

import type { PatternResult } from "@/lib/types";

interface PatternBreakdownProps {
  patterns: PatternResult[];
}

export default function PatternBreakdown({ patterns: _patterns }: PatternBreakdownProps) {
  // TODO: implement — filter out zero-count categories, render PatternRow per category
  return (
    <div className="space-y-2">
      <p className="text-text-secondary text-sm font-mono">// PatternBreakdown — TODO</p>
    </div>
  );
}
