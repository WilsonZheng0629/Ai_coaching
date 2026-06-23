import type { AnalysisReport, PoseFrame, PoseLandmark } from "./types";

const landmark = {
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
};

type Point = { x: number; y: number; visibility: number };

type DerivedFrame = {
  time: number;
  hip: Point;
  shoulder: Point;
  wrist: Point;
  leftAnkle: Point;
  rightAnkle: Point;
  footSpread: number;
  torsoLean: number;
  kneeAngle: number;
};

const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value));

const roundScore = (value: number) => Math.round(clamp(value));

const averagePoint = (
  landmarks: PoseLandmark[],
  a: number,
  b: number,
): Point | null => {
  const first = landmarks[a];
  const second = landmarks[b];
  if (!first || !second) return null;

  const firstVisibility = first.visibility ?? 1;
  const secondVisibility = second.visibility ?? 1;
  if (firstVisibility < 0.35 && secondVisibility < 0.35) return null;

  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
    visibility: (firstVisibility + secondVisibility) / 2,
  };
};

const point = (landmarks: PoseLandmark[], index: number): Point | null => {
  const value = landmarks[index];
  if (!value) return null;
  return {
    x: value.x,
    y: value.y,
    visibility: value.visibility ?? 1,
  };
};

const angle = (a: Point, b: Point, c: Point) => {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magA = Math.hypot(ab.x, ab.y);
  const magC = Math.hypot(cb.x, cb.y);
  if (!magA || !magC) return 150;
  return (Math.acos(clamp(dot / (magA * magC), -1, 1)) * 180) / Math.PI;
};

const scoreRange = (
  value: number,
  idealMin: number,
  idealMax: number,
  hardMin: number,
  hardMax: number,
) => {
  if (value >= idealMin && value <= idealMax) return 100;
  if (value < idealMin) {
    return clamp(((value - hardMin) / (idealMin - hardMin)) * 100);
  }
  return clamp(((hardMax - value) / (hardMax - idealMax)) * 100);
};

const coefficientOfVariation = (values: number[]) => {
  if (values.length < 2) return 0.35;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (!mean) return 0.35;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    values.length;
  return Math.sqrt(variance) / Math.abs(mean);
};

const deriveFrame = (frame: PoseFrame): DerivedFrame | null => {
  const hip = averagePoint(
    frame.landmarks,
    landmark.leftHip,
    landmark.rightHip,
  );
  const shoulder = averagePoint(
    frame.landmarks,
    landmark.leftShoulder,
    landmark.rightShoulder,
  );
  const wrist = averagePoint(
    frame.landmarks,
    landmark.leftWrist,
    landmark.rightWrist,
  );
  const leftAnkle = point(frame.landmarks, landmark.leftAnkle);
  const rightAnkle = point(frame.landmarks, landmark.rightAnkle);
  const leftKnee = point(frame.landmarks, landmark.leftKnee);
  const rightKnee = point(frame.landmarks, landmark.rightKnee);

  if (!hip || !shoulder || !wrist || !leftAnkle || !rightAnkle) return null;

  const leftHip = point(frame.landmarks, landmark.leftHip);
  const rightHip = point(frame.landmarks, landmark.rightHip);
  const leftKneeAngle =
    leftHip && leftKnee ? angle(leftHip, leftKnee, leftAnkle) : 150;
  const rightKneeAngle =
    rightHip && rightKnee ? angle(rightHip, rightKnee, rightAnkle) : 150;

  return {
    time: frame.time,
    hip,
    shoulder,
    wrist,
    leftAnkle,
    rightAnkle,
    footSpread: Math.abs(leftAnkle.x - rightAnkle.x),
    torsoLean:
      (Math.atan2(Math.abs(shoulder.x - hip.x), Math.abs(shoulder.y - hip.y)) *
        180) /
      Math.PI,
    kneeAngle: (leftKneeAngle + rightKneeAngle) / 2,
  };
};

const detectStepPeaks = (frames: DerivedFrame[], takeoffIndex: number) => {
  const beforeTakeoff = frames.slice(1, Math.max(2, takeoffIndex));
  const spreads = beforeTakeoff.map((frame) => frame.footSpread);
  const averageSpread =
    spreads.reduce((sum, value) => sum + value, 0) / Math.max(1, spreads.length);
  const threshold = averageSpread * 1.08;

  const peaks: DerivedFrame[] = [];
  for (let index = 1; index < beforeTakeoff.length - 1; index += 1) {
    const previous = beforeTakeoff[index - 1];
    const current = beforeTakeoff[index];
    const next = beforeTakeoff[index + 1];
    if (
      current.footSpread > previous.footSpread &&
      current.footSpread >= next.footSpread &&
      current.footSpread >= threshold
    ) {
      const lastPeak = peaks.at(-1);
      if (!lastPeak || current.time - lastPeak.time > 0.18) {
        peaks.push(current);
      }
    }
  }

  return peaks;
};

export function scoreApproach(frames: PoseFrame[], durationSeconds: number) {
  const derived = frames.map(deriveFrame).filter(Boolean) as DerivedFrame[];

  if (derived.length < 8) {
    return fallbackReport(durationSeconds, derived.length);
  }

  const movementDirection =
    derived.at(-1)!.hip.x - derived[0].hip.x >= 0 ? 1 : -1;
  const velocities = derived.slice(1).map((frame, index) => {
    const previous = derived[index];
    const deltaTime = frame.time - previous.time || 0.001;
    return ((frame.hip.x - previous.hip.x) * movementDirection) / deltaTime;
  });
  const positiveVelocities = velocities.filter((value) => value > 0.002);
  const averageVelocity =
    positiveVelocities.reduce((sum, value) => sum + value, 0) /
    Math.max(1, positiveVelocities.length);

  const takeoffIndex = derived.reduce((bestIndex, frame, index) => {
    if (index < derived.length * 0.45) return bestIndex;
    return frame.hip.y < derived[bestIndex].hip.y ? index : bestIndex;
  }, Math.floor(derived.length * 0.45));
  const takeoff = derived[takeoffIndex];

  const plantWindowStart = Math.max(0, takeoffIndex - 8);
  const plantWindow = derived.slice(plantWindowStart, takeoffIndex + 1);
  const plant = plantWindow.reduce((lowest, frame) =>
    frame.hip.y > lowest.hip.y ? frame : lowest,
  );

  const stepPeaks = detectStepPeaks(derived, takeoffIndex);
  const lastStep = stepPeaks.at(-1);
  const penultimateStep = stepPeaks.at(-2);
  const stepIntervals = stepPeaks
    .slice(1)
    .map((step, index) => step.time - stepPeaks[index].time);
  const stepTimingScore = 100 - coefficientOfVariation(stepIntervals) * 160;
  const accelerationScore = scoreRange(averageVelocity, 0.055, 0.18, 0.01, 0.32);
  const rhythmScore = roundScore(stepTimingScore * 0.58 + accelerationScore * 0.42);

  const penultimateRatio =
    penultimateStep && lastStep
      ? penultimateStep.footSpread / Math.max(lastStep.footSpread, 0.01)
      : 0.95;
  const prePlantHip =
    derived[Math.max(0, plantWindowStart - 4)] ?? derived[plantWindowStart];
  const hipDrop = plant.hip.y - prePlantHip.hip.y;
  const penultimateScore = roundScore(
    scoreRange(penultimateRatio, 1.05, 1.45, 0.65, 1.85) * 0.62 +
      scoreRange(hipDrop, 0.025, 0.11, -0.02, 0.18) * 0.38,
  );

  const armLoadFrame = derived
    .slice(0, takeoffIndex)
    .reverse()
    .find(
      (frame) =>
        (frame.wrist.x - frame.shoulder.x) * movementDirection < -0.025,
    );
  const armLeadTime = armLoadFrame ? takeoff.time - armLoadFrame.time : 0;
  const armAtTakeoff =
    (takeoff.wrist.x - takeoff.shoulder.x) * movementDirection;
  const armSwingTimingScore = roundScore(
    scoreRange(armLeadTime, 0.22, 0.65, 0.02, 1.1) * 0.7 +
      scoreRange(armAtTakeoff, -0.02, 0.18, -0.18, 0.34) * 0.3,
  );

  const hipRise = plant.hip.y - takeoff.hip.y;
  const takeoffScore = roundScore(
    scoreRange(plant.kneeAngle, 112, 148, 82, 176) * 0.35 +
      scoreRange(plant.torsoLean, 4, 20, 0, 42) * 0.25 +
      scoreRange(hipRise, 0.04, 0.16, 0, 0.26) * 0.4,
  );

  const landingFrames = derived.slice(takeoffIndex + 2, takeoffIndex + 10);
  const landing = landingFrames.find((frame) => frame.hip.y > plant.hip.y - 0.04);
  const landingScore = landing
    ? roundScore(
        scoreRange(landing.torsoLean, 3, 22, 0, 48) * 0.4 +
          scoreRange(landing.kneeAngle, 120, 165, 88, 180) * 0.35 +
          scoreRange(
            Math.abs(landing.footSpread - plant.footSpread),
            0,
            0.08,
            0,
            0.28,
          ) *
            0.25,
      )
    : 66;
  const consistencyScore = roundScore(
    rhythmScore * 0.45 + landingScore * 0.25 + takeoffScore * 0.3,
  );

  const subscores = [
    {
      label: "Approach Rhythm" as const,
      score: rhythmScore,
      explanation:
        "This estimates tempo consistency and whether speed appears to build into takeoff.",
      confidence: confidenceLabel(stepPeaks.length, derived.length),
    },
    {
      label: "Penultimate Step" as const,
      score: penultimateScore,
      explanation:
        "This estimates whether the second-to-last step creates enough loading before takeoff.",
      confidence: confidenceLabel(stepPeaks.length, derived.length),
    },
    {
      label: "Arm Swing Timing" as const,
      score: armSwingTimingScore,
      explanation:
        "This estimates whether the arm swing appears connected to the final plant and takeoff.",
      confidence: confidenceLabel(stepPeaks.length, derived.length),
    },
    {
      label: "Takeoff Mechanics" as const,
      score: takeoffScore,
      explanation:
        "This estimates knee bend, torso control, and visible hip rise near takeoff.",
      confidence: confidenceLabel(stepPeaks.length, derived.length),
    },
    {
      label: "Landing Control" as const,
      score: landingScore,
      explanation:
        "This estimates balance and body control after the jump based on visible landing frames.",
      confidence: landing ? confidenceLabel(stepPeaks.length, derived.length) : "Low",
    },
    {
      label: "Consistency Potential" as const,
      score: consistencyScore,
      explanation:
        "This combines rhythm, takeoff, and landing signals to estimate repeatability potential.",
      confidence: confidenceLabel(stepPeaks.length, derived.length),
    },
  ];

  const overallScore = roundScore(
    rhythmScore * 0.2 +
      penultimateScore * 0.25 +
      armSwingTimingScore * 0.2 +
      takeoffScore * 0.25 +
      landingScore * 0.07 +
      consistencyScore * 0.03,
  );

  const confidence = roundScore(
    Math.min(100, (derived.length / Math.max(frames.length, 1)) * 100) * 0.45 +
      Math.min(100, derived.length * 3) * 0.35 +
      Math.min(100, stepPeaks.length * 22) * 0.2,
  );

  return {
    source: "pose-algorithm" as const,
    overallScore,
    subscores,
    fixes: buildFixes(subscores),
    drills: buildDrills(subscores),
    summary: buildSummary(overallScore, confidence),
    metrics: {
      analyzedFrames: derived.length,
      durationSeconds: Number(durationSeconds.toFixed(1)),
      detectedSteps: stepPeaks.length,
      takeoffTimeSeconds: Number(takeoff.time.toFixed(2)),
      confidence,
    },
  } satisfies AnalysisReport;
}

function buildFixes(subscores: AnalysisReport["subscores"]) {
  const fixesByLabel = {
    "Approach Rhythm":
      "Your approach tempo looks uneven. Aim for a smoother build of speed into the last two steps.",
    "Penultimate Step":
      "Your penultimate step may not be creating enough low, long loading before takeoff.",
    "Arm Swing Timing":
      "Your arm swing timing appears slightly disconnected from the final plant.",
    "Takeoff Mechanics":
      "Your takeoff position could be stronger through knee bend, torso control, and vertical lift.",
    "Landing Control":
      "Your landing control looks unstable after takeoff. Focus on balanced, quiet landings.",
    "Consistency Potential":
      "Your repeatability may be limited by rhythm, takeoff, or landing variability.",
  };

  return [...subscores]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((subscore) => fixesByLabel[subscore.label]);
}

function buildDrills(subscores: AnalysisReport["subscores"]) {
  const drillsByLabel = {
    "Approach Rhythm": "Metronome 3-step approach rhythm drill",
    "Penultimate Step": "Penultimate step rhythm drill",
    "Arm Swing Timing": "Arm swing timing drill",
    "Takeoff Mechanics": "Approach-to-jump pause drill",
    "Landing Control": "Stick-the-landing control drill",
    "Consistency Potential": "Repeatable approach checkpoint drill",
  };

  return [...subscores]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((subscore) => drillsByLabel[subscore.label]);
}

function buildSummary(score: number, confidence: number) {
  if (confidence < 45) {
    return "Analysis confidence is low. Use a clearer side-view clip with the full body visible for better scoring.";
  }

  if (score >= 80) {
    return "Strong approach mechanics. Keep refining timing and repeatability under game speed.";
  }

  if (score >= 65) {
    return "Solid foundation with clear opportunities in the lowest-scoring movement areas.";
  }

  return "The approach needs cleanup before takeoff. Start with rhythm, loading, and body control.";
}

function confidenceLabel(stepCount: number, frameCount: number) {
  if (stepCount >= 3 && frameCount >= 32) return "Medium" as const;
  if (stepCount >= 2 && frameCount >= 18) return "Medium" as const;
  return "Low" as const;
}

function fallbackReport(durationSeconds: number, analyzedFrames: number) {
  return {
    source: "pose-algorithm" as const,
    overallScore: 58,
    subscores: [
      {
        label: "Approach Rhythm" as const,
        score: 58,
        explanation:
          "Low-confidence estimate because too few usable pose frames were detected.",
        confidence: "Low" as const,
      },
      {
        label: "Penultimate Step" as const,
        score: 56,
        explanation:
          "Low-confidence estimate because step timing was not clearly detected.",
        confidence: "Low" as const,
      },
      {
        label: "Arm Swing Timing" as const,
        score: 60,
        explanation:
          "Low-confidence estimate because arm landmarks were not consistently visible.",
        confidence: "Low" as const,
      },
      {
        label: "Takeoff Mechanics" as const,
        score: 57,
        explanation:
          "Low-confidence estimate because takeoff frames were not clear enough.",
        confidence: "Low" as const,
      },
      {
        label: "Landing Control" as const,
        score: 61,
        explanation:
          "Low-confidence estimate because landing frames were not clearly detected.",
        confidence: "Low" as const,
      },
      {
        label: "Consistency Potential" as const,
        score: 58,
        explanation:
          "Low-confidence estimate based on limited rhythm and body-control signals.",
        confidence: "Low" as const,
      },
    ],
    fixes: [
      "The athlete was not detected clearly enough across the clip.",
      "Use a full-body side view with the camera held still.",
      "Make sure the approach, takeoff, and landing are all visible.",
    ],
    drills: [
      "Side-view filming check",
      "Slow 3-step approach rehearsal",
      "Approach-to-jump pause drill",
    ],
    summary:
      "Analysis confidence is low because pose detection did not find enough usable frames.",
    metrics: {
      analyzedFrames,
      durationSeconds: Number(durationSeconds.toFixed(1)),
      detectedSteps: 0,
      confidence: 25,
    },
  } satisfies AnalysisReport;
}
