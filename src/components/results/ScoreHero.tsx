"use client";

import { useState, useEffect, useRef } from "react";
import type { ScoreResult } from "@/lib/types";
import { SCORE_TIERS, getGrade } from "@/lib/types";
import ProgressBar from "@/components/results/ProgressBar";

interface ScoreHeroProps {
  score: number;
  animateIn: boolean;
}

const gradeColour: Record<ScoreResult["grade"], string> = {
  human: "text-score-green",
  mixed: "text-score-amber",
  slop: "text-score-red",
};

const gradeBarColour: Record<ScoreResult["grade"], "green" | "amber" | "red"> = {
  human: "green",
  mixed: "amber",
  slop: "red",
};

export default function ScoreHero({ score, animateIn }: ScoreHeroProps) {
  const [displayScore, setDisplayScore] = useState(animateIn ? 0 : score);
  const rafRef = useRef<number | null>(null);

  const grade = getGrade(score);
  const colour = gradeColour[grade];
  const barColour = gradeBarColour[grade];
  const label = SCORE_TIERS[grade].label;

  useEffect(() => {
    if (!animateIn) {
      setDisplayScore(score);
      return;
    }

    // Count-up from 0 to score over 800ms ease-out
    const DURATION = 800;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [animateIn, score]);

  return (
    <div className="text-center space-y-4">
      <p className="text-xs tracking-widest uppercase text-text-secondary font-medium">
        Slop Score
      </p>

      <p
        className={`text-7xl md:text-8xl font-black tabular-nums leading-none ${colour}`}
        aria-label={`Slop score: ${score} out of 100`}
      >
        {displayScore}
      </p>

      <div className="max-w-xs mx-auto">
        <ProgressBar value={score} color={barColour} animate={animateIn} />
      </div>

      <p
        className={`text-sm uppercase tracking-widest font-medium ${colour}`}
        aria-label={`Grade: ${label}`}
      >
        {label}
      </p>
    </div>
  );
}
