// TODO(@engineer): Implement <ScoreButton />.
//
// Props:
//   isLoading: boolean
//   onClick: () => void
//   disabled: boolean
//
// Style: bg-accent text-bg-base font-semibold h-12 w-full
// Loading: replace label text with <Spinner /> — no layout shift.
// Label: "Score it"
//
// See docs/design.md §"Score it button".

"use client";

import Spinner from "@/components/ui/Spinner";

interface ScoreButtonProps {
  isLoading: boolean;
  onClick: () => void;
  disabled: boolean;
}

export default function ScoreButton({ isLoading, onClick, disabled }: ScoreButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      className="w-full h-12 bg-accent hover:bg-accent-hover text-bg-base font-semibold text-sm tracking-wide rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <Spinner size="sm" />
          <span>Scoring…</span>
        </>
      ) : (
        "Score it"
      )}
    </button>
  );
}
