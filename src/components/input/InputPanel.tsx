"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ScoreResult } from "@/lib/types";
import { calculateScore, toScoreResult } from "@/lib/scoring/engine";
import { isValidUrl } from "@/lib/utils";
import TabBar from "@/components/input/TabBar";
import UrlInput from "@/components/input/UrlInput";
import TextInput from "@/components/input/TextInput";
import ScoreButton from "@/components/input/ScoreButton";

interface InputPanelProps {
  onScore: (result: ScoreResult) => void;
}

export default function InputPanel({ onScore }: InputPanelProps) {
  // Default to text tab on mobile, url on desktop
  const [activeTab, setActiveTab] = useState<"url" | "text">("url");
  const [urlValue, setUrlValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile on mount and set default tab
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setActiveTab("text");
    }
  }, []);

  const handleTabChange = useCallback((tab: "url" | "text") => {
    setActiveTab(tab);
    setError(null);
  }, []);

  async function handleScore() {
    setError(null);

    if (activeTab === "url") {
      if (!urlValue.trim()) {
        setError("Paste a URL to get started.");
        return;
      }
      if (!isValidUrl(urlValue)) {
        setError("That doesn't look like a valid URL.");
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlValue }),
        });

        const data = await res.json();

        if (!res.ok) {
          // Scrape failed — show error and switch to text tab
          setError(data.message ?? "Couldn't fetch that page. Paste the text instead.");
          setActiveTab("text");
          setTimeout(() => textareaRef.current?.focus(), 50);
          return;
        }

        const slopScore = calculateScore(data.text);
        onScore(toScoreResult(slopScore, data.text));
      } catch {
        setError("Couldn't fetch that page. Paste the text instead.");
        setActiveTab("text");
        setTimeout(() => textareaRef.current?.focus(), 50);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Text tab — score directly, no API call
      const trimmed = textValue.trim();
      if (!trimmed) {
        setError("Paste some text to get started.");
        return;
      }

      const slopScore = calculateScore(trimmed);

      if (slopScore.note === "Text too short to score") {
        setError("Paste at least a few sentences for an accurate score.");
        return;
      }

      onScore(toScoreResult(slopScore, trimmed));
    }
  }

  const isDisabled =
    isLoading ||
    (activeTab === "url" ? !urlValue.trim() : !textValue.trim());

  return (
    <div className="space-y-6">
      {/* Tagline */}
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">No more mush.</h1>
        <p className="text-text-secondary text-base mt-1">
          Paste a URL or text. Get an honest score.
        </p>
      </div>

      {/* Tab bar */}
      <TabBar active={activeTab} onChange={handleTabChange} />

      {/* Input area */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "url" ? (
          <UrlInput
            value={urlValue}
            onChange={(v) => { setUrlValue(v); setError(null); }}
            error={error}
            inputRef={urlInputRef}
          />
        ) : (
          <TextInput
            value={textValue}
            onChange={(v) => { setTextValue(v); setError(null); }}
            charCount={textValue.length}
            textareaRef={textareaRef}
          />
        )}

        {/* Show text-tab error inline below textarea */}
        {activeTab === "text" && error && (
          <p className="text-score-red text-xs mt-2 flex items-center gap-1">
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
      </div>

      {/* Score button */}
      <ScoreButton
        isLoading={isLoading}
        onClick={handleScore}
        disabled={isDisabled}
      />

      {/* Disclaimer */}
      <p className="text-xs text-text-tertiary text-center max-w-sm mx-auto leading-relaxed">
        Scores writing quality, not authorship. High scores mean mush, not AI.
      </p>
    </div>
  );
}
