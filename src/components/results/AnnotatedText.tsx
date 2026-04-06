"use client";

import { useState, useMemo } from "react";
import type { HighlightSpan } from "@/lib/types";

interface AnnotatedTextProps {
  text: string;
  highlights: HighlightSpan[];
  defaultCollapsed?: boolean;
}

export default function AnnotatedText({
  text,
  highlights,
  defaultCollapsed = false,
}: AnnotatedTextProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  // Build non-overlapping highlight segments
  const segments = useMemo(() => {
    if (highlights.length === 0) return [{ text, highlighted: false, category: "" }];

    // Sort by start, merge overlaps
    const sorted = [...highlights].sort((a, b) => a.start - b.start);
    const merged: HighlightSpan[] = [];
    for (const span of sorted) {
      const last = merged[merged.length - 1];
      if (last && span.start < last.end) {
        // Merge — extend the end, keep the first category
        merged[merged.length - 1] = { ...last, end: Math.max(last.end, span.end) };
      } else {
        merged.push({ ...span });
      }
    }

    // Walk through text building segments
    const result: Array<{ text: string; highlighted: boolean; category: string }> = [];
    let cursor = 0;

    for (const span of merged) {
      if (span.start > cursor) {
        result.push({ text: text.slice(cursor, span.start), highlighted: false, category: "" });
      }
      result.push({
        text: text.slice(span.start, span.end),
        highlighted: true,
        category: span.category,
      });
      cursor = span.end;
    }

    if (cursor < text.length) {
      result.push({ text: text.slice(cursor), highlighted: false, category: "" });
    }

    return result;
  }, [text, highlights]);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="text-xs font-medium tracking-widest uppercase text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
      >
        <span
          className={`transition-transform duration-200 ${collapsed ? "" : "rotate-90"}`}
          aria-hidden="true"
        >
          &#9656;
        </span>
        Annotated text
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          collapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
        }`}
      >
        <div className="bg-bg-surface rounded p-4 font-mono text-sm leading-relaxed text-text-mono whitespace-pre-wrap">
          {segments.map((seg, i) =>
            seg.highlighted ? (
              <mark
                key={i}
                className="bg-accent/15 text-accent rounded-sm px-0.5"
                title={seg.category}
              >
                {seg.text}
              </mark>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
