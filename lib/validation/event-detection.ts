import type { PoseLandmark } from "@/lib/analysis/types";
import type {
  ValidationPoseFrame,
  VideoQualityMetrics,
  VolleyballEvents,
} from "./pose-schema";

const leftHip = 23;
const rightHip = 24;
const leftAnkle = 27;
const rightAnkle = 28;
const leftFoot = 31;
const rightFoot = 32;

const average = (values: number[]) =>
  values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;

const landmarkVisible = (landmark?: PoseLandmark, minimum = 0.5) =>
  Boolean(landmark && (landmark.visibility ?? 1) >= minimum);

const hipCenter = (landmarks: PoseLandmark[]) => {
  const left = landmarks[leftHip];
  const right = landmarks[rightHip];
  if (!left || !right) return null;
  return {
    x: (left.x + right.x) / 2,
    y: (left.y + right.y) / 2,
    visibility: ((left.visibility ?? 1) + (right.visibility ?? 1)) / 2,
  };
};

const footSpread = (landmarks: PoseLandmark[]) => {
  const left = landmarks[leftAnkle] ?? landmarks[leftFoot];
  const right = landmarks[rightAnkle] ?? landmarks[rightFoot];
  if (!left || !right) return 0;
  return Math.abs(left.x - right.x);
};

function visibleAthleteBounds(landmarks: PoseLandmark[]) {
  const visible = landmarks.filter((landmark) => (landmark.visibility ?? 1) > 0.5);
  if (!visible.length) return null;

  return {
    minX: Math.min(...visible.map((landmark) => landmark.x)),
    maxX: Math.max(...visible.map((landmark) => landmark.x)),
    minY: Math.min(...visible.map((landmark) => landmark.y)),
    maxY: Math.max(...visible.map((landmark) => landmark.y)),
  };
}

export function detectVolleyballEvents(
  frames: ValidationPoseFrame[],
): VolleyballEvents {
  const tracked = frames
    .map((frame) => ({
      ...frame,
      hip: hipCenter(frame.landmarks),
      spread: footSpread(frame.landmarks),
    }))
    .filter((frame) => frame.hip && !frame.isMissing);

  if (tracked.length < 6) return {};

  const direction =
    tracked.at(-1)!.hip!.x - tracked[0].hip!.x >= 0 ? 1 : -1;
  const hipVelocities = tracked.slice(1).map((frame, index) => {
    const previous = tracked[index];
    const dt = frame.timestamp - previous.timestamp || 0.001;
    return ((frame.hip!.x - previous.hip!.x) * direction) / dt;
  });
  const velocityThreshold = Math.max(0.015, average(hipVelocities) * 0.35);
  const approachStart =
    tracked.find((_, index) => hipVelocities[index] > velocityThreshold) ??
    tracked[0];

  const peakJump = tracked.reduce((best, frame) =>
    frame.hip!.y < best.hip!.y ? frame : best,
  );
  const peakIndex = tracked.findIndex(
    (frame) => frame.frameNumber === peakJump.frameNumber,
  );

  const prePeak = tracked.slice(0, Math.max(1, peakIndex));
  const spreadAverage = average(prePeak.map((frame) => frame.spread));
  const stepCandidates = prePeak.filter(
    (frame, index, source) =>
      index > 0 &&
      index < source.length - 1 &&
      frame.spread >= spreadAverage * 1.05 &&
      frame.spread >= source[index - 1].spread &&
      frame.spread >= source[index + 1].spread,
  );

  const plantStep = stepCandidates.at(-1) ?? prePeak.at(-1);
  const penultimateStep = stepCandidates.at(-2);

  const takeoff =
    [...prePeak]
      .reverse()
      .find((frame) => frame.hip!.y > peakJump.hip!.y + 0.035) ?? plantStep;

  const landing = tracked
    .slice(peakIndex + 1)
    .find((frame) => {
      if (!plantStep || !frame.hip) return false;
      return frame.hip.y >= plantStep.hip!.y - 0.035;
    });

  return {
    approachStart: approachStart?.timestamp,
    penultimateStep: penultimateStep?.timestamp,
    plantStep: plantStep?.timestamp,
    takeoff: takeoff?.timestamp,
    peakJump: peakJump.timestamp,
    landing: landing?.timestamp,
  };
}

export function analyzeVideoQuality(
  frames: ValidationPoseFrame[],
  events: VolleyballEvents,
): VideoQualityMetrics {
  const missingFrames = frames.filter((frame) => frame.isMissing).length;
  const missingFramePercentage = frames.length
    ? Math.round((missingFrames / frames.length) * 100)
    : 100;
  const averageConfidence = Number(
    average(frames.map((frame) => frame.averageConfidence)).toFixed(3),
  );
  const framesWithLostTracking = frames.filter(
    (frame) => frame.isMissing || frame.averageConfidence < 0.55,
  ).length;

  const warnings: string[] = [];
  if (averageConfidence < 0.7) {
    warnings.push(
      "Video confidence is low due to inconsistent landmark detection.",
    );
  }
  if (missingFramePercentage > 5) {
    warnings.push("Pose tracking is missing on more than 5% of sampled frames.");
  }

  const footMissingCount = frames.filter((frame) => {
    if (frame.isMissing) return true;
    return (
      !landmarkVisible(frame.landmarks[leftAnkle]) ||
      !landmarkVisible(frame.landmarks[rightAnkle])
    );
  }).length;
  const footVisibilityPercentage = Math.round(
    ((frames.length - footMissingCount) / Math.max(1, frames.length)) * 100,
  );
  if (footMissingCount / Math.max(1, frames.length) > 0.15) {
    warnings.push("Feet are not visible enough for reliable step detection.");
  }

  const offscreenCount = frames.filter((frame) => {
    const bounds = visibleAthleteBounds(frame.landmarks);
    if (!bounds) return true;
    return (
      bounds.minX < 0.02 ||
      bounds.maxX > 0.98 ||
      bounds.minY < 0.02 ||
      bounds.maxY > 0.98
    );
  }).length;
  if (offscreenCount / Math.max(1, frames.length) > 0.12) {
    warnings.push("Athlete may be partially off screen in part of the video.");
  }
  const athleteOffscreenPercentage = Math.round(
    (offscreenCount / Math.max(1, frames.length)) * 100,
  );

  const hipXs = frames
    .map((frame) => hipCenter(frame.landmarks)?.x)
    .filter((value): value is number => typeof value === "number");
  const horizontalTravel = hipXs.length ? Math.max(...hipXs) - Math.min(...hipXs) : 0;
  if (horizontalTravel < 0.08) {
    warnings.push(
      "Camera movement or weak side-view motion may reduce approach phase accuracy.",
    );
  }

  if (!events.takeoff) {
    warnings.push("Takeoff phase could not be identified reliably.");
  }
  if (!events.landing) {
    warnings.push(
      "Landing phase could not be analyzed because it may be missing or outside the frame.",
    );
  }

  const orderedEvents = [
    events.approachStart,
    events.penultimateStep,
    events.plantStep,
    events.takeoff,
    events.peakJump,
    events.landing,
  ].filter((value): value is number => typeof value === "number");
  const phaseOrderValid = orderedEvents.every(
    (timestamp, index) => index === 0 || timestamp >= orderedEvents[index - 1],
  );
  if (!phaseOrderValid) {
    warnings.push("Detected approach phases are out of chronological order.");
  }

  const estimatedAnalysisQuality =
    averageConfidence > 0.85 &&
    missingFramePercentage < 5 &&
    footVisibilityPercentage >= 85 &&
    athleteOffscreenPercentage <= 5 &&
    phaseOrderValid
      ? "High"
      : averageConfidence > 0.7 && phaseOrderValid
        ? "Medium"
        : "Low";

  return {
    averageConfidence,
    missingFramePercentage,
    framesWithLostTracking,
    footVisibilityPercentage,
    athleteOffscreenPercentage,
    phaseOrderValid,
    estimatedAnalysisQuality,
    warnings,
  };
}
