// TODO(@engineer): Implement <ScoreHero />.
//
// Props:
//   score: number       (0–100)
//   animateIn: boolean  (trigger count-up on true)
//
// Layout (centred block):
//   "SLOP SCORE"  — text-xs tracking-widest uppercase text-text-secondary
//   [score number] — text-7xl md:text-8xl font-black tabular-nums, colour-coded
//   [progress bar] — <ProgressBar value={score} color={...} animate={animateIn} />
//   [grade label]  — "HUMAN" | "MIXED" | "SLOP" — text-sm uppercase tracking-widest
//
// Score colouring:
//   0–30:   text-score-green, grade "HUMAN"
//   31–69:  text-score-amber, grade "MIXED"
//   70–100: text-score-red,   grade "SLOP"
//
// Count-up animation: 0 → score over 800ms ease-out using requestAnimationFrame.
//   Implement with useEffect + useRef — start when animateIn becomes true.
//   Do NOT use a third-party animation library.
//
// Accessibility:
//   aria-label="Slop score: {score} out of 100" on the score number element
//   role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} on bar
//   aria-label="Grade: {grade}" on grade label
//
// See docs/design.md §"Score hero block" and §"Score Visualisation — Decision".

"use client";

import type { ScoreResult } from "@/lib/types";
import { SCORE_TIERS, getGrade } from "@/lib/types";

interface ScoreHeroProps {
  score: number;
  animateIn: boolean;
}

// Map grade to Tailwind colour class
const gradeColour: Record<ScoreResult["grade"], string> = {
  human: "text-score-green",
  mixed: "text-score-amber",
  slop:  "text-score-red",
};

export default function ScoreHero({ score, animateIn: _animateIn }: ScoreHeroProps) {
  // TODO: implement count-up animation with requestAnimationFrame
  const grade = getGrade(score);
  const colour = gradeColour[grade];
  const label = SCORE_TIERS[grade].label;

  return (
    <div className="text-center space-y-3">
      <p className="text-xs tracking-widest uppercase text-text-secondary">Slop Score</p>
      <p
        className={`text-7xl md:text-8xl font-black tabular-nums ${colour}`}
        aria-label={`Slop score: ${score} out of 100`}
      >
        {score}
      </p>
      {/* TODO: <ProgressBar value={score} color={...} animate={animateIn} /> */}
      <p
        className={`text-sm uppercase tracking-widest ${colour}`}
        aria-label={`Grade: ${label}`}
      >
        {label}
      </p>
    </div>
  );
}
