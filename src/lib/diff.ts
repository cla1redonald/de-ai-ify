// Simple word-level diff for showing rewrite changes.
// Uses longest common subsequence to align words.

export interface DiffSegment {
  type: "same" | "added" | "removed";
  text: string;
}

function tokenize(text: string): string[] {
  // Split into words and whitespace, preserving whitespace for reconstruction
  return text.match(/\S+|\s+/g) ?? [];
}

// LCS-based word diff — O(n*m) but texts are short (< 5000 words)
function lcs(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

export function computeDiff(original: string, rewritten: string): DiffSegment[] {
  const a = tokenize(original);
  const b = tokenize(rewritten);
  const dp = lcs(a, b);

  // Backtrack to build diff
  const segments: DiffSegment[] = [];
  let i = a.length;
  let j = b.length;

  const result: DiffSegment[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
      result.push({ type: "same", text: b[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: "added", text: b[j - 1] });
      j--;
    } else {
      result.push({ type: "removed", text: a[i - 1] });
      i--;
    }
  }

  result.reverse();

  // Merge consecutive segments of the same type
  const merged: DiffSegment[] = [];
  for (const seg of result) {
    const last = merged[merged.length - 1];
    if (last && last.type === seg.type) {
      last.text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }

  return merged;
}
