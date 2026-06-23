import type { PoseLandmark } from "@/lib/analysis/types";

export const poseLandmarkNames = [
  "nose",
  "left_eye_inner",
  "left_eye",
  "left_eye_outer",
  "right_eye_inner",
  "right_eye",
  "right_eye_outer",
  "left_ear",
  "right_ear",
  "mouth_left",
  "mouth_right",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_pinky",
  "right_pinky",
  "left_index",
  "right_index",
  "left_thumb",
  "right_thumb",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
  "left_heel",
  "right_heel",
  "left_foot_index",
  "right_foot_index",
] as const;

export const skeletonConnections = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [27, 29],
  [29, 31],
  [24, 26],
  [26, 28],
  [28, 30],
  [30, 32],
] as const;

export type PoseFrameRecord = {
  videoId: string;
  frameNumber: number;
  timestamp: number;
  landmarkName: string;
  landmarkIndex: number;
  x: number;
  y: number;
  z: number;
  visibility: number;
  confidence: number;
};

export type ValidationPoseFrame = {
  videoId: string;
  frameNumber: number;
  timestamp: number;
  imageDataUrl: string;
  landmarks: PoseLandmark[];
  averageConfidence: number;
  isMissing: boolean;
};

export type VolleyballEvents = {
  approachStart?: number;
  penultimateStep?: number;
  plantStep?: number;
  takeoff?: number;
  peakJump?: number;
  landing?: number;
};

export type VideoQualityMetrics = {
  averageConfidence: number;
  missingFramePercentage: number;
  framesWithLostTracking: number;
  footVisibilityPercentage: number;
  athleteOffscreenPercentage: number;
  phaseOrderValid: boolean;
  takeoffDetectionErrorFrames?: number;
  landingDetectionErrorFrames?: number;
  estimatedAnalysisQuality: "High" | "Medium" | "Low";
  warnings: string[];
};

export type ValidationResult = {
  videoId: string;
  durationSeconds: number;
  frameCount: number;
  frames: ValidationPoseFrame[];
  landmarkRows: PoseFrameRecord[];
  quality: VideoQualityMetrics;
  events: VolleyballEvents;
};
