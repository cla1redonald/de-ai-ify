// TODO(@engineer): Implement <ProgressBar />.
//
// Props:
//   value: number     (0–100)
//   color: 'green' | 'amber' | 'red'
//   animate: boolean
//
// Style: h-1.5 rounded-full bg-border-subtle (track), filled portion uses score colour.
// Animation: CSS transition on width. On mount, if animate=true:
//   start at width 0%, transition to final value over ~800ms (simultaneous with count-up).
//   Use useEffect + useState to trigger the transition after a tick.
//
// Accessibility: role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}
//
// See docs/design.md §"<ProgressBar />".

"use client";

import { useState, useEffect } from "react";

const colourMap = {
  green: "bg-score-green",
  amber: "bg-score-amber",
  red: "bg-score-red",
};

interface ProgressBarProps {
  value: number;
  color: "green" | "amber" | "red";
  animate: boolean;
}

export default function ProgressBar({ value, color, animate }: ProgressBarProps) {
  // Start at 0, then transition to final value on next tick so CSS transition fires
  const [width, setWidth] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setWidth(value);
      return;
    }
    // One frame delay ensures the initial 0% renders before we set the target
    const frame = requestAnimationFrame(() => {
      setWidth(value);
    });
    return () => cancelAnimationFrame(frame);
  }, [animate, value]);

  return (
    <div
      className="h-1.5 rounded-full bg-border-subtle overflow-hidden"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Score: ${value} out of 100`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-[800ms] ease-out ${colourMap[color]}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
