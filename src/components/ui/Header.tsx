// TODO(@engineer): Implement <Header /> — static, no props.
//
// Layout:
//   - Left-aligned logo mark (editorial delete/strikethrough X symbol, accent colour)
//   - "de-ai-ify" wordmark in Inter 600, text-primary
//   - Optional subline: "AI Slop Score" in text-tertiary text-xs
//   - No navigation, no right-side content
//
// See docs/design.md §"Global shell" and §"Header".

export default function Header() {
  return (
    <header className="flex items-center gap-3 mb-12">
      {/* TODO: implement */}
      <span className="font-semibold text-text-primary">de-ai-ify</span>
    </header>
  );
}
