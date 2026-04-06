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
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function UrlInput({ value, onChange, error, inputRef }: UrlInputProps) {
  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://linkedin.com/posts/..."
        aria-label="URL to score"
        aria-describedby={error ? "url-error" : undefined}
        aria-invalid={error ? true : undefined}
        className={`w-full bg-bg-surface border rounded px-3 py-3 text-text-primary text-sm font-mono placeholder:text-text-tertiary transition-colors ${
          error ? "border-score-red" : "border-border-subtle hover:border-text-tertiary focus:border-accent"
        }`}
      />
      {error && (
        <p id="url-error" className="text-score-red text-xs flex items-center gap-1">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}
