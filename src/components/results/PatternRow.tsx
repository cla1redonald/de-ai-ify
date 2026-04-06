"use client";

import { useState } from "react";
import type { PatternResult } from "@/lib/types";

interface PatternRowProps {
  pattern: PatternResult;
  defaultOpen?: boolean;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const severityColor = {
  low: "bg-score-green/15 text-score-green",
  medium: "bg-score-amber/15 text-score-amber",
  high: "bg-score-red/15 text-score-red",
} as const;

const severityDot = {
  low: "bg-score-green",
  medium: "bg-score-amber",
  high: "bg-score-red",
} as const;

export default function PatternRow({ pattern, defaultOpen = false }: PatternRowProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border-subtle rounded overflow-hidden transition-colors hover:border-border-subtle/80">
      <button
        className="w-full flex items-center gap-3 p-3 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {/* Severity dot */}
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${severityDot[pattern.severity]}`} />

        {/* Category name */}
        <span className="text-sm font-medium text-text-primary flex-1">
          {pattern.category}
        </span>

        {/* Count pill — show count for pattern categories, severity label for statistical */}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityColor[pattern.severity]}`}>
          {pattern.count > 0 ? pattern.count : pattern.severity}
        </span>

        {/* Chevron */}
        <span
          className={`text-text-tertiary text-xs transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          aria-hidden="true"
        >
          &#9656;
        </span>
      </button>

      {/* Expanded instances */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 pb-3 pt-0">
          <div className="bg-bg-surface rounded p-3 space-y-1.5">
            {pattern.detail && (
              <p className="text-xs leading-relaxed text-text-secondary">
                {pattern.detail}
              </p>
            )}
            {pattern.instances.map((instance, i) => (
              <p
                key={i}
                className="font-mono text-xs leading-relaxed text-text-mono"
                dangerouslySetInnerHTML={{
                  __html: escapeHtml(instance).replace(
                    /\*\*(.*?)\*\*/g,
                    '<mark class="bg-accent/20 text-accent rounded-sm px-0.5 font-medium">$1</mark>'
                  ),
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
