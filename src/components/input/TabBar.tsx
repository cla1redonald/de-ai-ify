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

import { useRef, KeyboardEvent } from "react";

interface TabBarProps {
  active: "url" | "text";
  onChange: (tab: "url" | "text") => void;
}

const TABS = [
  { id: "url" as const, label: "Paste URL" },
  { id: "text" as const, label: "Paste Text" },
];

export default function TabBar({ active, onChange }: TabBarProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === "ArrowRight") {
      const next = (index + 1) % TABS.length;
      tabRefs.current[next]?.focus();
      onChange(TABS[next].id);
    } else if (e.key === "ArrowLeft") {
      const prev = (index - 1 + TABS.length) % TABS.length;
      tabRefs.current[prev]?.focus();
      onChange(TABS[prev].id);
    }
  }

  return (
    <div role="tablist" aria-label="Input method" className="flex gap-6 border-b border-border-subtle">
      {TABS.map((tab, i) => (
        <button
          key={tab.id}
          ref={(el) => { tabRefs.current[i] = el; }}
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          tabIndex={active === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className={
            active === tab.id
              ? "text-accent border-b-2 border-accent pb-2 text-sm font-medium -mb-px transition-colors"
              : "text-text-secondary pb-2 text-sm hover:text-text-primary transition-colors"
          }
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
