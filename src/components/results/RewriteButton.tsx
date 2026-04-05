// TODO(@engineer): Implement <RewriteButton />.
//
// Props:
//   onClick: () => void
//   isLoading: boolean
//   rewritesRemaining: number   // shows "N rewrites remaining today" if < 3
//   disabled: boolean
//
// Style: outline variant — border-accent text-accent hover:bg-accent hover:text-bg-base
//   w-full, h-12
//   Loading: swap label for <Spinner />
//   Label: "Clean it up"
//
// Beneath button: "N rewrites remaining today" in text-tertiary text-xs
//   (only show if rewritesRemaining < 3)
//
// See docs/design.md §"Rewrite button".

"use client";

import Spinner from "@/components/ui/Spinner";

interface RewriteButtonProps {
  onClick: () => void;
  isLoading: boolean;
  rewritesRemaining: number;
  disabled: boolean;
}

export default function RewriteButton({
  onClick,
  isLoading,
  rewritesRemaining,
  disabled,
}: RewriteButtonProps) {
  // TODO: implement
  return (
    <div className="space-y-1">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className="w-full h-12 border border-accent text-accent hover:bg-accent hover:text-bg-base text-sm font-semibold tracking-wide rounded transition-colors disabled:opacity-50"
      >
        {isLoading ? <Spinner size="sm" /> : "Clean it up"}
      </button>
      {rewritesRemaining < 3 && (
        <p className="text-center text-text-tertiary text-xs">
          {rewritesRemaining} rewrite{rewritesRemaining !== 1 ? "s" : ""} remaining today
        </p>
      )}
    </div>
  );
}
