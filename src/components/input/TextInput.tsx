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
}

export default function TextInput({ value, onChange, charCount }: TextInputProps) {
  // TODO: implement — add mobile-always-visible char count logic
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the text you want to score..."
        className="w-full min-h-40 md:min-h-52 bg-bg-surface border border-border-subtle rounded px-3 py-2 text-text-primary text-sm font-mono placeholder:text-text-tertiary resize-y"
      />
      {charCount > 50 && (
        <span className="absolute bottom-2 right-3 text-text-tertiary text-xs">
          {charCount.toLocaleString()}
        </span>
      )}
    </div>
  );
}
