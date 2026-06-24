import type {
  AthleteProfile,
  DrillRecommendation,
  SimilarAthleteComparison,
} from "@/lib/types";

export const defaultAthleteProfile: AthleteProfile = {
  firstName: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  dominantHand: "",
  position: "",
  skillLevel: "",
  standingReach: "",
  maxTouch: "",
  mainGoal: "",
  playStyle: "",
};

export const sampleComparison: SimilarAthleteComparison = {
  label: "Sample comparison - real athlete database not connected yet.",
  userProfile: {
    position: "Opposite",
    height: "5'8\"",
    standingReach: "7'6\"",
    maxTouch: "9'10\"",
    skillLevel: "Club",
  },
  group: {
    profiles: 127,
    topPerformerAverageApproachScore: 88,
    topPerformerAverageMaxTouch: "10'2\"",
    commonStrengths: [
      "Longer penultimate step",
      "Earlier arm swing timing",
      "More upright takeoff posture",
    ],
  },
  biggestGap: "Penultimate step efficiency",
  explanation:
    "Among similar high-performing athletes, the penultimate step tends to create better loading before takeoff. Your current profile suggests this may be the highest-impact area to improve first.",
};

export const drillRecommendations: DrillRecommendation[] = [
  {
    title: "Penultimate Step Rhythm Drill",
    purpose: "Improve loading and approach rhythm.",
    steps: [
      "Start from a 3-step approach",
      "Emphasize a longer, controlled penultimate step",
      "Keep chest tall",
      "Jump vertically after the last two steps",
    ],
    sets: "3 sets of 5 reps",
  },
  {
    title: "Arm Swing Timing Drill",
    purpose: "Coordinate arm swing with takeoff.",
    steps: [
      "Practice slow-motion approaches",
      "Start arm swing before takeoff",
      "Focus on timing, not max jump",
    ],
    sets: "3 sets of 6 reps",
  },
  {
    title: "Approach Pause Drill",
    purpose: "Improve body control before takeoff.",
    steps: [
      "Approach normally",
      "Pause briefly after the penultimate step",
      "Check body posture",
      "Finish the jump",
    ],
    sets: "3 sets of 4 reps",
  },
];

export const dashboardProgress = {
  totalUploads: 3,
  latestScore: 72,
  bestScore: 78,
  mostImprovedArea: "Approach Rhythm",
  focusAreaThisWeek: "Penultimate Step",
  nextUploadGoal:
    "Film another side-view approach after practicing penultimate step rhythm.",
  progress: [
    { week: "Week 1", score: 61 },
    { week: "Week 2", score: 68 },
    { week: "Week 3", score: 72 },
  ],
};
