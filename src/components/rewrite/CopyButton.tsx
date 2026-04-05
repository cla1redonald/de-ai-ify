// TODO(@engineer): Implement <CopyButton />.
//
// Props:
//   text: string   // text to copy to clipboard
//
// State: { copied: boolean }
//
// Behaviour:
//   onClick: navigator.clipboard.writeText(text), set copied=true, revert after 2000ms
//   Label: "Copy" → "Copied" for 2 seconds
//   Micro-interaction: active:scale-95 transition-transform
//
// Style: bg-accent text-bg-base font-semibold h-10 w-full rounded
//
// See docs/design.md §"<CopyButton />" and §"Micro-interactions".

"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  // TODO: implement clipboard write + revert timer
  const handleClick = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full h-10 bg-accent text-bg-base font-semibold text-sm rounded active:scale-95 transition-transform"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
