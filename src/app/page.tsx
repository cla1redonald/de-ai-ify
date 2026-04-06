"use client";

import { useState, useCallback } from "react";
import type { ScoreResult } from "@/lib/types";
import Header from "@/components/ui/Header";
import InputPanel from "@/components/input/InputPanel";
import ResultsPanel from "@/components/results/ResultsPanel";
import RewritePanel from "@/components/rewrite/RewritePanel";

type AppState = "input" | "results" | "rewrite";

const REWRITES_PER_DAY = 3;
const STORAGE_KEY = "deaiify_rewrites";

function getRewritesRemaining(): number {
  if (typeof window === "undefined") return REWRITES_PER_DAY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return REWRITES_PER_DAY;
    const { count, windowStart } = JSON.parse(raw);
    const elapsed = Date.now() - windowStart;
    if (elapsed > 86400000) return REWRITES_PER_DAY; // 24h reset
    return Math.max(0, REWRITES_PER_DAY - count);
  } catch {
    return REWRITES_PER_DAY;
  }
}

function recordRewrite() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let count = 1;
    let windowStart = Date.now();
    if (raw) {
      const prev = JSON.parse(raw);
      if (Date.now() - prev.windowStart < 86400000) {
        count = prev.count + 1;
        windowStart = prev.windowStart;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count, windowStart }));
  } catch {
    // localStorage unavailable — server is the real gate
  }
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("input");
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [rewriteResult, setRewriteResult] = useState<string | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewritesRemaining, setRewritesRemaining] = useState(getRewritesRemaining);

  const handleScore = useCallback((result: ScoreResult) => {
    setScoreResult(result);
    setRewriteResult(null);
    setAppState("results");
  }, []);

  const handleRewrite = useCallback(async () => {
    if (!scoreResult || rewritesRemaining <= 0) return;

    setIsRewriting(true);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: scoreResult.originalText }),
      });

      if (res.status === 429) {
        setRewritesRemaining(0);
        return;
      }

      const data = await res.json();
      if (!res.ok) return;

      recordRewrite();
      setRewritesRemaining(getRewritesRemaining());
      setRewriteResult(data.rewritten);
      setAppState("rewrite");
    } finally {
      setIsRewriting(false);
    }
  }, [scoreResult, rewritesRemaining]);

  const handleReset = useCallback(() => {
    setAppState("input");
    setScoreResult(null);
    setRewriteResult(null);
  }, []);

  const handleBackToResults = useCallback(() => {
    setAppState("results");
  }, []);

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 min-h-screen">
      <Header />

      <div className="mt-10">
        {appState === "input" && <InputPanel onScore={handleScore} />}

        {appState === "results" && scoreResult && (
          <ResultsPanel
            result={scoreResult}
            onRewrite={handleRewrite}
            onReset={handleReset}
            rewritesRemaining={rewritesRemaining}
            isRewriting={isRewriting}
          />
        )}

        {appState === "rewrite" && scoreResult && rewriteResult && (
          <RewritePanel
            original={scoreResult.originalText}
            rewritten={rewriteResult}
            onBack={handleBackToResults}
            onReset={handleReset}
          />
        )}
      </div>
    </main>
  );
}
