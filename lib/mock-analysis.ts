import type { AnalysisReport } from "./analysis/types";

export const analysisReport = {
  source: "mock",
  overallScore: 72,
  subscores: [
    {
      label: "Approach Rhythm",
      score: 76,
      explanation:
        "Your approach tempo appears mostly controlled, with some room to build speed more smoothly.",
      confidence: "Medium",
    },
    {
      label: "Penultimate Step",
      score: 64,
      explanation:
        "Your second-to-last step appears shorter than ideal, which may reduce how much force you can transfer into takeoff.",
      confidence: "Medium",
    },
    {
      label: "Arm Swing Timing",
      score: 70,
      explanation:
        "Your arm swing may start slightly late relative to the final plant.",
      confidence: "Medium",
    },
    {
      label: "Takeoff Mechanics",
      score: 74,
      explanation:
        "Your takeoff shape appears usable, but torso posture may limit vertical lift.",
      confidence: "Medium",
    },
    {
      label: "Landing Control",
      score: 78,
      explanation:
        "Your landing appears reasonably controlled based on the visible frames.",
      confidence: "Medium",
    },
    {
      label: "Consistency Potential",
      score: 69,
      explanation:
        "Your repeatability may improve if the penultimate step and arm swing timing become more consistent.",
      confidence: "Medium",
    },
  ],
  fixes: [
    "Penultimate step may be too short: a short penultimate step can make it harder to lower your center of mass and load your jump.",
    "Arm swing may start late: if the arm swing starts too late, it can reduce timing between your approach speed and takeoff.",
    "Torso may lean forward too much at takeoff: too much forward lean can make it harder to jump vertically and contact the ball high.",
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
