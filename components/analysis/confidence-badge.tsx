import type { ConfidenceLevel } from "@/lib/types";

type ConfidenceBadgeProps = {
  level: ConfidenceLevel;
};

const styles = {
  High: "border-emerald-300/40 bg-emerald-400/15 text-emerald-100",
  Medium: "border-amber-300/40 bg-amber-400/15 text-amber-100",
  Low: "border-red-300/40 bg-red-400/15 text-red-100",
};

export function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${styles[level]}`}
    >
      {level} confidence
    </span>
  );
}
