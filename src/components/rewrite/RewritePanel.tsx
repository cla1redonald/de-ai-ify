// TODO(@engineer): Implement <RewritePanel />.
//
// Props:
//   original: string
//   rewritten: string
//   onBack: () => void
//
// Layout (see docs/design.md §"State 3 — Rewrite"):
//   [← "Back to results" link — calls onBack]
//
//   Desktop (lg:grid-cols-2 gap-6):
//     <TextPane label="ORIGINAL" text={original} muted={true} />
//     <TextPane label="REWRITTEN" text={rewritten} muted={false} />
//     <CopyButton text={rewritten} /> (in rewritten column)
//
//   Mobile (stacked):
//     <TextPane label="REWRITTEN" text={rewritten} muted={false} />
//     <CopyButton text={rewritten} /> full-width
//     "Show original ↓" disclosure — collapsed by default
//     <TextPane label="ORIGINAL" text={original} muted={true} /> (when expanded)
//
//   Beneath rewrite: "Want to check the rewrite? Paste it in."
//     Link back to input — do not auto-resubmit.
//
// See docs/design.md §"<RewritePanel />".

"use client";

interface RewritePanelProps {
  original: string;
  rewritten: string;
  onBack: () => void;
}

export default function RewritePanel({
  original: _original,
  rewritten: _rewritten,
  onBack: _onBack,
}: RewritePanelProps) {
  // TODO: implement two-column desktop / stacked mobile layout
  return (
    <div className="space-y-6">
      <p className="text-text-secondary text-sm font-mono">// RewritePanel — TODO</p>
    </div>
  );
}
