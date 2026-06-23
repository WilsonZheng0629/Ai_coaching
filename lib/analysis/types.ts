export type SubscoreLabel =
  | "Approach Rhythm"
  | "Penultimate Step"
  | "Arm Swing Timing"
  | "Takeoff Mechanics"
  | "Landing Control"
  | "Consistency Potential";

export type AnalysisSubscore = {
  label: SubscoreLabel;
  score: number;
  explanation?: string;
  confidence?: "High" | "Medium" | "Low";
};

export type AnalysisReport = {
  source: "pose-algorithm" | "mock";
  overallScore: number;
  subscores: AnalysisSubscore[];
  fixes: string[];
  drills: string[];
  summary: string;
  metrics?: {
    analyzedFrames: number;
    durationSeconds: number;
    detectedSteps: number;
    takeoffTimeSeconds?: number;
    confidence: number;
  };
};

export type PoseLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

export type PoseFrame = {
  time: number;
  landmarks: PoseLandmark[];
};
