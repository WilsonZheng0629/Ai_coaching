import type { PoseFrame } from "@/lib/analysis/types";
import {
  poseLandmarkNames,
  type PoseFrameRecord,
  type ValidationPoseFrame,
  type ValidationResult,
} from "./pose-schema";
import { analyzeVideoQuality, detectVolleyballEvents } from "./event-detection";

const maxValidationSamples = 120;

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

function captureFrame(video: HTMLVideoElement) {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 960;
  canvas.height = video.videoHeight || 540;
  const context = canvas.getContext("2d");
  if (!context) return "";
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

function averageConfidence(landmarks: PoseFrame["landmarks"]) {
  if (!landmarks.length) return 0;
  const total = landmarks.reduce(
    (sum, landmark) => sum + (landmark.visibility ?? 1),
    0,
  );
  return Number((total / landmarks.length).toFixed(3));
}

function toLandmarkRows(frame: ValidationPoseFrame): PoseFrameRecord[] {
  return frame.landmarks.map((landmark, index) => ({
    videoId: frame.videoId,
    frameNumber: frame.frameNumber,
    timestamp: frame.timestamp,
    landmarkName: poseLandmarkNames[index] ?? `landmark_${index}`,
    landmarkIndex: index,
    x: Number(landmark.x.toFixed(5)),
    y: Number(landmark.y.toFixed(5)),
    z: Number((landmark.z ?? 0).toFixed(5)),
    visibility: Number((landmark.visibility ?? 1).toFixed(5)),
    confidence: Number((landmark.visibility ?? 1).toFixed(5)),
  }));
}

export async function validateVideoElement(
  video: HTMLVideoElement,
  onProgress?: (progress: number) => void,
): Promise<ValidationResult> {
  const { FilesetResolver, PoseLandmarker } = await import(
    "@mediapipe/tasks-vision"
  );

  if (!Number.isFinite(video.duration) || video.duration <= 0) {
    throw new Error("Video duration is not available yet.");
  }

  const videoId =
    globalThis.crypto?.randomUUID?.() ?? `video-${Date.now().toString(36)}`;
  const vision = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
  const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/models/pose_landmarker_lite.task",
      delegate: "CPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.35,
    minPosePresenceConfidence: 0.35,
    minTrackingConfidence: 0.35,
  });

  const duration = video.duration;
  const sampleCount = Math.max(
    18,
    Math.min(maxValidationSamples, Math.floor(duration * 12)),
  );
  const frames: ValidationPoseFrame[] = [];
  const originalTime = video.currentTime;

  try {
    for (let index = 0; index < sampleCount; index += 1) {
      const timestamp = (duration * index) / Math.max(1, sampleCount - 1);
      await waitForSeek(video, timestamp);
      const imageDataUrl = captureFrame(video);
      const result = poseLandmarker.detectForVideo(
        video,
        Math.round(timestamp * 1000),
      );
      const landmarks = result.landmarks[0] ?? [];
      frames.push({
        videoId,
        frameNumber: index,
        timestamp: Number(timestamp.toFixed(3)),
        imageDataUrl,
        landmarks,
        averageConfidence: averageConfidence(landmarks),
        isMissing: landmarks.length === 0,
      });
      onProgress?.(Math.round(((index + 1) / sampleCount) * 100));
    }
  } finally {
    poseLandmarker.close();
    await waitForSeek(video, Math.min(originalTime, video.duration - 0.05)).catch(
      () => undefined,
    );
  }

  const landmarkRows = frames.flatMap(toLandmarkRows);
  const events = detectVolleyballEvents(frames);
  const quality = analyzeVideoQuality(frames, events);
  const result: ValidationResult = {
    videoId,
    durationSeconds: Number(duration.toFixed(2)),
    frameCount: frames.length,
    frames,
    landmarkRows,
    quality,
    events,
  };

  sessionStorage.setItem("athletiq-validation-result", JSON.stringify(result));

  return result;
}

