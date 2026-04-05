// TODO(@engineer): Implement <TextPane />.
//
// Props:
//   label: string      // "ORIGINAL" | "REWRITTEN"
//   text: string
//   muted?: boolean    // true for original — uses text-text-tertiary
//
// Style:
//   Container: bg-bg-surface rounded p-4 font-mono text-sm leading-relaxed
//   Label: text-xs font-medium tracking-widest uppercase — text-text-secondary
//   Text: muted ? text-text-tertiary : text-text-primary
//
// See docs/design.md §"<TextPane />".

interface TextPaneProps {
  label: string;
  text: string;
  muted?: boolean;
}

export default function TextPane({ label, text, muted = false }: TextPaneProps) {
  return (
    <div className="bg-bg-surface rounded p-4 space-y-3">
      <p className="text-xs font-medium tracking-widest uppercase text-text-secondary">
        {label}
      </p>
      <p className={`font-mono text-sm leading-relaxed whitespace-pre-wrap ${muted ? "text-text-tertiary" : "text-text-primary"}`}>
        {text}
      </p>
    </div>
  );
}
