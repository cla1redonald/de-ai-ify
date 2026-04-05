// TODO(@engineer): Implement <TabBar />.
//
// Props:
//   active: 'url' | 'text'
//   onChange: (tab: 'url' | 'text') => void
//
// Style: underline indicator (NOT pill/box). Use ARIA tablist pattern.
//   Active tab:   text-accent border-b-2 border-accent pb-1
//   Inactive tab: text-text-secondary hover:text-text-primary
//
// Accessibility:
//   role="tablist" on container
//   role="tab" aria-selected={active === tab} on each button
//   Keyboard: arrow keys to navigate between tabs (standard ARIA pattern)
//
// See docs/design.md §"Tab bar" and §"Accessibility Baseline".

"use client";

interface TabBarProps {
  active: "url" | "text";
  onChange: (tab: "url" | "text") => void;
}

export default function TabBar({ active, onChange }: TabBarProps) {
  // TODO: implement full ARIA tablist
  return (
    <div role="tablist" className="flex gap-6 border-b border-border-subtle">
      {(["url", "text"] as const).map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className={
            active === tab
              ? "text-accent border-b-2 border-accent pb-2 text-sm font-medium"
              : "text-text-secondary pb-2 text-sm hover:text-text-primary"
          }
        >
          {tab === "url" ? "Paste URL" : "Paste Text"}
        </button>
      ))}
    </div>
  );
}
