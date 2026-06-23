import type { AnalysisReport } from "./analysis/types";

export const analysisReport = {
  source: "mock",
  overallScore: 72,
  subscores: [
    { label: "Approach Rhythm", score: 76 },
    { label: "Penultimate Step", score: 64 },
    { label: "Arm Swing Timing", score: 70 },
    { label: "Takeoff Mechanics", score: 74 },
    { label: "Landing Control", score: 78 },
  ],
  fixes: [
    "Your penultimate step looks too short, which may reduce jump power.",
    "Your arm swing starts slightly late, which may affect timing.",
    "Your torso leans forward too much at takeoff.",
  ],
  drills: [
    "Penultimate step rhythm drill",
    "Arm swing timing drill",
    "Approach-to-jump pause drill",
  ],
  summary:
    "Strong base, with the biggest opportunity in penultimate step length and arm swing timing.",
} satisfies AnalysisReport;

export const dashboardStats = {
  totalUploads: 3,
  latestScore: 72,
  bestScore: 78,
  progress: [
    { week: "Week 1", score: 61 },
    { week: "Week 2", score: 68 },
    { week: "Week 3", score: 72 },
  ],
};
