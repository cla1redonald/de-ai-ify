// TODO(@engineer): Implement <Spinner /> — simple CSS animate-spin border spinner.
//
// Props:
//   size?: 'sm' | 'md'  (default: 'md')
//
// No library dependency. Use Tailwind animate-spin on a bordered circle element.
// Used inside <ScoreButton /> loading state — must match the button's text height
// so there is no layout shift when the label swaps to spinner.
//
// See docs/design.md §"<Spinner />".

interface SpinnerProps {
  size?: "sm" | "md";
}

export default function Spinner({ size = "md" }: SpinnerProps) {
  // TODO: implement
  const dim = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <span
      className={`${dim} inline-block rounded-full border-2 border-current border-t-transparent animate-spin`}
      aria-hidden="true"
    />
  );
}
