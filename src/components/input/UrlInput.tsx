// TODO(@engineer): Implement <UrlInput />.
//
// Props:
//   value: string
//   onChange: (val: string) => void
//   error: string | null
//
// A type="url" full-width input.
// Placeholder: "https://linkedin.com/posts/..."
// Show inline error beneath input when error !== null.
// Client-side validation message: "That doesn't look like a valid URL."
//
// See docs/design.md §"URL input".

"use client";

interface UrlInputProps {
  value: string;
  onChange: (val: string) => void;
  error: string | null;
}

export default function UrlInput({ value, onChange, error }: UrlInputProps) {
  // TODO: implement
  return (
    <div className="space-y-1">
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://linkedin.com/posts/..."
        className="w-full bg-bg-surface border border-border-subtle rounded px-3 py-2 text-text-primary text-sm font-mono placeholder:text-text-tertiary"
      />
      {error && <p className="text-score-red text-xs">{error}</p>}
    </div>
  );
}
