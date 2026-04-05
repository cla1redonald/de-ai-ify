// TODO(@engineer): Implement <InputPanel />.
//
// Props:
//   onScore: (result: ScoreResult) => void
//
// State (local):
//   activeTab: 'url' | 'text'
//   urlValue: string
//   textValue: string
//   isLoading: boolean
//   error: string | null
//
// Layout (see docs/design.md §"State 1 — Input"):
//   [Tagline — one punchy line, e.g. "No more mush."]
//   [<TabBar active={activeTab} onChange={setActiveTab} />]
//   [<UrlInput /> or <TextInput /> — conditional on activeTab]
//   [<ScoreButton isLoading={isLoading} onClick={handleScore} />]
//   [Disclaimer copy beneath button]
//
// Behaviour:
//   - Default active tab: 'text' on mobile (window.innerWidth < 640), 'url' on desktop.
//     Detect on mount with useEffect — do not render tab-dependent content on server.
//   - URL tab: call POST /api/scrape, then run calculateScore() on returned text.
//   - Text tab: run calculateScore() directly (no API call). Debounce 300ms.
//   - On scrape failure: set error, auto-switch to 'text' tab, focus the textarea.
//   - On success: call onScore(result).
//
// See docs/design.md §"<InputPanel />", §"<TabBar />".
// See docs/architecture.md §"Flow 1" and §"Flow 2".

"use client";

import type { ScoreResult } from "@/lib/types";

interface InputPanelProps {
  onScore: (result: ScoreResult) => void;
}

export default function InputPanel({ onScore: _onScore }: InputPanelProps) {
  // TODO: implement
  return (
    <div className="space-y-6">
      <p className="text-text-secondary text-sm font-mono">
        // InputPanel — TODO
      </p>
    </div>
  );
}
