// TODO(@engineer): Implement the root page component.
//
// This is the single-page app. It owns the top-level state machine:
//   type AppState = 'input' | 'results' | 'rewrite'
//
// State:
//   - appState: AppState
//   - input: { mode: 'url' | 'text', value: string }
//   - scoreResult: ScoreResult | null   (from src/lib/scoring/engine.ts)
//   - rewriteResult: string | null
//
// Layout (all states render within max-w-2xl mx-auto px-4 py-12):
//   State 'input'   → <Header /> + <InputPanel onScore={...} />
//   State 'results' → <Header /> + <ResultsPanel result={...} onRewrite={...} onReset={...} />
//   State 'rewrite' → <Header /> + <RewritePanel original={...} rewritten={...} onBack={...} />
//
// Rewrite rate limiting (client-side display only, server is authoritative):
//   localStorage key: 'deaiify_rewrites' → { count: number, windowStart: number }
//   Show remaining rewrites from this; server's 429 is the real gate.
//
// See docs/design.md §4 for full state/layout spec.
// See docs/architecture.md for data flow diagrams.

"use client";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <p className="text-text-secondary text-sm font-mono">
        // de-ai-ify scaffold — @engineer implements this
      </p>
    </main>
  );
}
