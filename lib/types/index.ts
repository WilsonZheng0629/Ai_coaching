export type ConfidenceLevel = "High" | "Medium" | "Low";

export type AthleteProfile = {
  firstName: string;
  age: string;
  gender: "Female" | "Male" | "Non-binary" | "Prefer not to say" | "";
  height: string;
  weight: string;
  dominantHand: "Right" | "Left" | "Both" | "";
  position:
    | "Outside Hitter"
    | "Opposite"
    | "Middle Blocker"
    | "Setter"
    | "Libero"
    | "Defensive Specialist"
    | "";
  skillLevel:
    | "Beginner"
    | "JV"
    | "Club"
    | "Varsity"
    | "D3"
    | "D2"
    | "D1"
    | "Pro"
    | "";
  standingReach: string;
  maxTouch: string;
  mainGoal:
    | "Jump higher"
    | "Hit harder"
    | "Improve approach timing"
    | "Improve footwork"
    | "Improve consistency"
    | "Improve landing control"
    | "";
  playStyle: string;
};

export type DrillRecommendation = {
  title: string;
  purpose: string;
  steps: string[];
  sets: string;
};

export type SimilarAthleteComparison = {
  label: string;
  userProfile: {
    position: string;
    height: string;
    standingReach: string;
    maxTouch: string;
    skillLevel: string;
  };
  group: {
    profiles: number;
    topPerformerAverageApproachScore: number;
    topPerformerAverageMaxTouch: string;
    commonStrengths: string[];
  };
  biggestGap: string;
  explanation: string;
};
