type ScoreBarProps = {
  label: string;
  score: number;
};

export function ScoreBar({ label, score }: ScoreBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-slate-200">{label}</span>
        <span className="font-bold text-white">{score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-volt"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
