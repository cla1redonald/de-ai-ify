// TODO(@engineer): Implement <AnnotatedText />.
//
// Props:
//   text: string
//   highlights: HighlightSpan[]    // { start, end, category }
//   defaultCollapsed?: boolean     // true on mobile (docs/design.md §7)
//
// Renders text with <mark> elements wrapping highlighted spans.
//   Highlight style: className="bg-[rgba(232,197,71,0.18)] rounded-sm px-0.5"
//   Tooltip: title={span.category} on the <mark> element
//   <mark> has semantic meaning for annotated/highlighted text (accessibility win)
//
// Algorithm:
//   1. Sort highlights by start position.
//   2. Walk through text, alternating plain text segments and <mark> spans.
//   3. Overlapping spans: merge or take the first (decide and be consistent).
//
// On mobile (defaultCollapsed=true): wrap in a disclosure with "Show annotated text ↓".
//   Use useState for open/closed — do NOT use <details> (styling limitations).
//
// Container: bg-bg-surface rounded p-4 font-mono text-sm leading-relaxed
//
// See docs/design.md §"Highlighted text panel" and §"<AnnotatedText />".

"use client";

import type { HighlightSpan } from "@/lib/types";

interface AnnotatedTextProps {
  text: string;
  highlights: HighlightSpan[];
  defaultCollapsed?: boolean;
}

export default function AnnotatedText({
  text: _text,
  highlights: _highlights,
  defaultCollapsed = false,
}: AnnotatedTextProps) {
  // TODO: implement span-walking render and disclosure on mobile
  void defaultCollapsed;
  return (
    <div className="bg-bg-surface rounded p-4 font-mono text-sm leading-relaxed text-text-mono">
      <p className="text-text-tertiary text-xs">// AnnotatedText — TODO</p>
    </div>
  );
}
