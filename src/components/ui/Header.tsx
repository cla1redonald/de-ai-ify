"use client";

export default function Header() {
  return (
    <header className="flex items-center gap-3 mb-12">
      {/* Editorial delete mark — a strikethrough X in accent gold */}
      <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0" aria-hidden="true">
        <span className="absolute inset-0 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Stylised editorial delete mark: circle with diagonal strike */}
            <circle cx="16" cy="16" r="14" stroke="#E8C547" strokeWidth="1.5" fill="none" />
            <line x1="9" y1="9" x2="23" y2="23" stroke="#E8C547" strokeWidth="2" strokeLinecap="round" />
            <line x1="23" y1="9" x2="9" y2="23" stroke="#E8C547" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      </div>

      <div>
        <p className="font-semibold text-lg leading-none text-text-primary tracking-tight">
          de-ai-ify
        </p>
        <p className="text-xs text-text-tertiary tracking-wide mt-0.5">
          AI Slop Score
        </p>
      </div>
    </header>
  );
}
