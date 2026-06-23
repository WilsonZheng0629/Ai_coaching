import { scoreApproach } from "./scoring";
import type { AnalysisReport, PoseFrame } from "./types";

const maxSamples = 72;

function waitForSeek(video: HTMLVideoElement, time: number) {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", handleError);
    };
    const handleSeeked = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("Could not read the selected video."));
    };

    video.addEventListener("seeked", handleSeeked, { once: true });
    video.addEventListener("error", handleError, { once: true });
    video.currentTime = Math.min(time, Math.max(0, video.duration - 0.05));
  });
}

export async function analyzeVideoElement(
  video: HTMLVideoElement,
  onProgress?: (progress: number) => void,
): Promise<AnalysisReport> {
  const { FilesetResolver, PoseLandmarker } = await import(
    "@mediapipe/tasks-vision"
  );

  if (!Number.isFinite(video.duration) || video.duration <= 0) {
    throw new Error("Video duration is not available yet.");
  }

  const vision = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
  const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/models/pose_landmarker_lite.task",
      delegate: "CPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.45,
    minPosePresenceConfidence: 0.45,
    minTrackingConfidence: 0.45,
  });

  const duration = video.duration;
  const sampleCount = Math.max(
    12,
    Math.min(maxSamples, Math.floor(duration * 8)),
  );
  const frames: PoseFrame[] = [];
  const originalTime = video.currentTime;

  try {
    for (let index = 0; index < sampleCount; index += 1) {
      const time = (duration * index) / Math.max(1, sampleCount - 1);
      await waitForSeek(video, time);
      const result = poseLandmarker.detectForVideo(video, Math.round(time * 1000));
      const landmarks = result.landmarks[0];
      if (landmarks?.length) {
        frames.push({ time, landmarks });
      }
      onProgress?.(Math.round(((index + 1) / sampleCount) * 100));
    }
  } finally {
    poseLandmarker.close();
    await waitForSeek(video, Math.min(originalTime, video.duration - 0.05)).catch(
      () => undefined,
    );
  }

  return scoreApproach(frames, duration);
}
