// TODO(@engineer): Implement <TextInput />.
//
// Props:
//   value: string
//   onChange: (val: string) => void
//   charCount: number
//
// A textarea with:
//   min-height: 200px desktop / 160px mobile (use min-h-40 md:min-h-52)
//   font-mono text-sm
//   Char count: bottom-right corner, text-tertiary, visible after 50 chars
//     (always visible on mobile per docs/design.md §7)
//   Placeholder: "Paste the text you want to score..."
//
// See docs/design.md §"Text area".

"use client";

interface TextInputProps {
  value: string;
  onChange: (val: string) => void;
  charCount: number;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export default function TextInput({ value, onChange, charCount, textareaRef }: TextInputProps) {
  // Show char count: always on mobile (sm:), after 50 chars on desktop
  const showCharCount = charCount > 50;

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the text you want to score..."
        aria-label="Text to score"
        className="w-full min-h-40 md:min-h-52 bg-bg-surface border border-border-subtle rounded px-3 py-3 text-text-primary text-sm font-mono placeholder:text-text-tertiary resize-y hover:border-text-tertiary focus:border-accent transition-colors"
      />
      {/* Always visible on mobile; on desktop only after 50 chars */}
      <span
        className={`absolute bottom-3 right-3 text-text-tertiary text-xs pointer-events-none transition-opacity ${
          showCharCount ? "opacity-100" : "opacity-0 sm:opacity-0"
        } sm:opacity-100`}
        aria-live="polite"
        aria-atomic="true"
      >
        {charCount > 0 ? charCount.toLocaleString() : ""}
      </span>
    </div>
  );
}
