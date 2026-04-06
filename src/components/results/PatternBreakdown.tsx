import type { PatternResult } from "@/lib/types";
import PatternRow from "@/components/results/PatternRow";

interface PatternBreakdownProps {
  patterns: PatternResult[];
}

export default function PatternBreakdown({ patterns }: PatternBreakdownProps) {
  const visible = patterns.filter((p) => p.count > 0 || p.detail);
  if (visible.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-medium tracking-widest uppercase text-text-secondary">
        What we found
      </h2>
      <div className="space-y-2">
        {visible.map((p, i) => (
          <PatternRow key={p.category} pattern={p} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
}
