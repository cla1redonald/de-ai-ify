interface SpinnerProps {
  size?: "sm" | "md";
}

export default function Spinner({ size = "md" }: SpinnerProps) {
  const dim = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <span
      className={`${dim} inline-block rounded-full border-2 border-current border-t-transparent animate-spin`}
      aria-hidden="true"
    />
  );
}
