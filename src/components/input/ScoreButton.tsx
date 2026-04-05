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
  // TODO: implement
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full h-12 bg-accent text-bg-base font-semibold text-sm tracking-wide rounded disabled:opacity-50"
    >
      {isLoading ? <Spinner size="sm" /> : "Score it"}
    </button>
  );
}
