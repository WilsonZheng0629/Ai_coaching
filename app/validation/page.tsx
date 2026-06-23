"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bug,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Pause,
  Play,
  ShieldCheck,
  TableProperties,
  Upload,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import {
  datasetSources,
  firstPartyCollectionTargets,
  labelingColumns,
  sourceLogColumns,
  validationMetrics,
} from "@/lib/validation/dataset-plan";
import { validateVideoElement } from "@/lib/validation/browser-validation";
import {
  poseLandmarkNames,
  skeletonConnections,
  type ValidationPoseFrame,
  type ValidationResult,
} from "@/lib/validation/pose-schema";

const formatTime = (value?: number) =>
  typeof value === "number" ? `${value.toFixed(2)}s` : "Not detected";

const qualityStyles = {
  High: "border-emerald-300/40 bg-emerald-400/15 text-emerald-100",
  Medium: "border-amber-300/40 bg-amber-400/15 text-amber-100",
  Low: "border-red-300/40 bg-red-400/15 text-red-100",
};

const statusLabels = {
  "usable-if-verified": "Usable if verified",
  "reference-only": "Reference only",
  "not-enough": "Not enough",
};

const statusStyles = {
  "usable-if-verified":
    "border-emerald-300/40 bg-emerald-400/10 text-emerald-100",
  "reference-only": "border-amber-300/40 bg-amber-400/10 text-amber-100",
  "not-enough": "border-red-300/40 bg-red-400/10 text-red-100",
};

function drawSkeleton(
  canvas: HTMLCanvasElement,
  frame: ValidationPoseFrame | undefined,
  showSkeleton: boolean,
  showLabels: boolean,
) {
  const context = canvas.getContext("2d");
  if (!context) return;

  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!frame?.imageDataUrl) return;

  const image = new Image();
  image.onload = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    if (!showSkeleton || !frame.landmarks.length) return;

    context.lineWidth = 3;
    context.strokeStyle = "#2df6c8";
    context.fillStyle = "#2df6c8";
    context.font = "11px sans-serif";

    skeletonConnections.forEach(([from, to]) => {
      const start = frame.landmarks[from];
      const end = frame.landmarks[to];
      if (!start || !end) return;
      if ((start.visibility ?? 1) < 0.35 || (end.visibility ?? 1) < 0.35) {
        return;
      }
      context.beginPath();
      context.moveTo(start.x * canvas.width, start.y * canvas.height);
      context.lineTo(end.x * canvas.width, end.y * canvas.height);
      context.stroke();
    });

    frame.landmarks.forEach((landmark, index) => {
      if ((landmark.visibility ?? 1) < 0.35) return;
      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;
      context.beginPath();
      context.arc(x, y, 4, 0, Math.PI * 2);
      context.fill();
      if (showLabels) {
        context.fillStyle = "#ffffff";
        context.fillText(poseLandmarkNames[index] ?? `${index}`, x + 6, y - 6);
        context.fillStyle = "#2df6c8";
      }
    });
  };
  image.src = frame.imageDataUrl;
}

export default function ValidationPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playbackTimer = useRef<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");

  const currentFrame = result?.frames[currentFrameIndex];
  const selectedRows = useMemo(
    () =>
      result?.landmarkRows.filter(
        (row) => row.frameNumber === currentFrameIndex,
      ) ?? [],
    [currentFrameIndex, result],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawSkeleton(canvas, currentFrame, showSkeleton, showLabels);
  }, [currentFrame, showLabels, showSkeleton]);

  useEffect(() => {
    if (!isPlaying || !result) return;

    playbackTimer.current = window.setInterval(() => {
      setCurrentFrameIndex((index) => {
        if (index >= result.frames.length - 1) {
          setIsPlaying(false);
          return index;
        }
        return index + 1;
      });
    }, 120);

    return () => {
      if (playbackTimer.current) window.clearInterval(playbackTimer.current);
    };
  }, [isPlaying, result]);

  const runValidation = async () => {
    if (!videoRef.current) return;
    setError("");
    setIsRunning(true);
    setProgress(0);
    setIsPlaying(false);

    try {
      const validation = await validateVideoElement(videoRef.current, setProgress);
      setResult(validation);
      setCurrentFrameIndex(0);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Validation failed. Try a shorter side-view video.",
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 lg:py-14">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-volt">
              Internal Validation
            </p>
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              MediaPipe Tracking Dashboard
            </h1>
            <p className="mt-3 max-w-3xl leading-7 text-slate-300">
              This page verifies whether AthletIQ can reliably extract pose
              landmarks and volleyball approach events from real side-view
              videos. It is not a coaching report.
            </p>
          </div>
          <div className="rounded-lg border border-red-300/30 bg-red-400/10 p-4 text-sm font-semibold leading-6 text-red-50">
            Accuracy gate: scoring and coaching should not be trusted until
            landmark tracking, takeoff detection, and landing detection are
            manually validated here.
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-lg border border-white/10 bg-navy-900/80 p-5">
            <h2 className="mb-4 text-lg font-black text-white">
              Original Video
            </h2>
            <label
              className="focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-volt flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-navy-950/70 p-6 text-center"
              htmlFor="validation-video"
            >
              <Upload className="mb-3 text-volt" size={34} aria-hidden />
              <span className="font-black text-white">
                Upload side-view approach video
              </span>
              <span className="mt-2 text-sm text-slate-400">
                Internal validation only. Nothing is sent to a backend yet.
              </span>
              <input
                accept="video/*"
                className="sr-only"
                id="validation-video"
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (videoUrl) URL.revokeObjectURL(videoUrl);
                  setVideoUrl(URL.createObjectURL(file));
                  setFileName(file.name);
                  setResult(null);
                  setCurrentFrameIndex(0);
                  setProgress(0);
                  setError("");
                }}
              />
            </label>

            {videoUrl ? (
              <div className="mt-5">
                <p className="mb-3 truncate text-sm font-bold text-slate-200">
                  {fileName}
                </p>
                <video
                  ref={videoRef}
                  className="aspect-video w-full rounded-lg border border-white/10 bg-black object-contain"
                  controls
                  src={videoUrl}
                />
                <button
                  className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-volt px-5 py-3 font-black text-navy-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                  disabled={isRunning}
                  onClick={runValidation}
                  type="button"
                >
                  <Bug size={18} aria-hidden />
                  {isRunning ? "Extracting Landmarks..." : "Run Validation"}
                </button>
              </div>
            ) : null}

            {isRunning ? (
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm font-bold text-slate-100">
                  <span>Frame extraction and pose detection</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-volt"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : null}

            {error ? (
              <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
                {error}
              </p>
            ) : null}
          </section>

          <section className="rounded-lg border border-white/10 bg-navy-900/80 p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-black text-white">
                Skeleton Overlay
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  className="focus-ring inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-bold text-white"
                  disabled={!result}
                  onClick={() => setIsPlaying((value) => !value)}
                  type="button"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  className="focus-ring inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-bold text-white"
                  onClick={() => setShowSkeleton((value) => !value)}
                  type="button"
                >
                  {showSkeleton ? <Eye size={16} /> : <EyeOff size={16} />}
                  Skeleton
                </button>
                <button
                  className="focus-ring inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-bold text-white"
                  onClick={() => setShowLabels((value) => !value)}
                  type="button"
                >
                  <TableProperties size={16} />
                  Labels
                </button>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              className="aspect-video w-full rounded-lg border border-white/10 bg-black"
              height={540}
              width={960}
            />

            {result ? (
              <div className="mt-5">
                <input
                  className="w-full accent-[#2df6c8]"
                  max={result.frames.length - 1}
                  min={0}
                  onChange={(event) =>
                    setCurrentFrameIndex(Number(event.target.value))
                  }
                  type="range"
                  value={currentFrameIndex}
                />
                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-bold text-slate-400">Frame</p>
                    <p className="mt-1 font-black text-white">
                      {currentFrameIndex + 1} / {result.frames.length}
                    </p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-bold text-slate-400">Timestamp</p>
                    <p className="mt-1 font-black text-white">
                      {formatTime(currentFrame?.timestamp)}
                    </p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-bold text-slate-400">Frame Confidence</p>
                    <p className="mt-1 font-black text-white">
                      {currentFrame?.averageConfidence.toFixed(3)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Run validation to view frame-by-frame landmark visualization.
              </p>
            )}
          </section>
        </div>

        {result ? (
          <>
            <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <h2 className="mb-4 text-lg font-black text-white">
                Landmark Quality Metrics
              </h2>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-white/10 bg-navy-950/70 p-4">
                  <p className="text-sm font-bold text-slate-400">
                    Average Confidence
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {result.quality.averageConfidence}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-navy-950/70 p-4">
                  <p className="text-sm font-bold text-slate-400">
                    Missing Frames
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {result.quality.missingFramePercentage}%
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-navy-950/70 p-4">
                  <p className="text-sm font-bold text-slate-400">
                    Lost Tracking Frames
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {result.quality.framesWithLostTracking}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-navy-950/70 p-4">
                  <p className="text-sm font-bold text-slate-400">
                    Foot Visibility
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {result.quality.footVisibilityPercentage}%
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-navy-950/70 p-4">
                  <p className="text-sm font-bold text-slate-400">
                    Athlete Off-Screen
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {result.quality.athleteOffscreenPercentage}%
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-navy-950/70 p-4">
                  <p className="text-sm font-bold text-slate-400">
                    Phase Order
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {result.quality.phaseOrderValid ? "Valid" : "Invalid"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-navy-950/70 p-4">
                  <p className="text-sm font-bold text-slate-400">
                    Analysis Quality
                  </p>
                  <p
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-black ${qualityStyles[result.quality.estimatedAnalysisQuality]}`}
                  >
                    {result.quality.estimatedAnalysisQuality}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                Takeoff and landing error are intentionally not scored until a
                human reviewer adds frame labels for this clip.
              </p>

              {result.quality.warnings.length ? (
                <div className="mt-5 space-y-3">
                  {result.quality.warnings.map((warning) => (
                    <div
                      className="flex gap-3 rounded-lg border border-amber-300/30 bg-amber-400/10 p-4 text-sm font-semibold leading-6 text-amber-50"
                      key={warning}
                    >
                      <AlertTriangle className="shrink-0" size={18} />
                      {warning}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-4 text-sm font-semibold text-emerald-50">
                  No major quality warnings detected in sampled frames.
                </p>
              )}
            </section>

            <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <h2 className="mb-4 text-lg font-black text-white">
                Volleyball Event Detection V1
              </h2>
              <div className="grid gap-3 md:grid-cols-3">
                {Object.entries(result.events).map(([eventName, timestamp]) => (
                  <div
                    className="rounded-lg border border-white/10 bg-navy-950/70 p-4"
                    key={eventName}
                  >
                    <p className="text-sm font-bold capitalize text-slate-400">
                      {eventName.replace(/([A-Z])/g, " $1")}
                    </p>
                    <p className="mt-2 text-xl font-black text-white">
                      {formatTime(timestamp)}
                    </p>
                  </div>
                ))}
              </div>
              <pre className="mt-5 overflow-auto rounded-lg border border-white/10 bg-navy-950 p-4 text-xs leading-6 text-slate-200">
                {JSON.stringify(result.events, null, 2)}
              </pre>
            </section>

            <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">
                    Landmark Table
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Showing all landmark coordinates for the selected frame.
                    Full extracted rows are stored in session storage as
                    PoseFrame records.
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-300">
                  Stored rows: {result.landmarkRows.length}
                </p>
              </div>
              <div className="max-h-[440px] overflow-auto rounded-lg border border-white/10">
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead className="sticky top-0 bg-navy-950 text-slate-300">
                    <tr>
                      <th className="p-3">Frame</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Landmark</th>
                      <th className="p-3">X</th>
                      <th className="p-3">Y</th>
                      <th className="p-3">Z</th>
                      <th className="p-3">Visibility</th>
                      <th className="p-3">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRows.map((row) => (
                      <tr
                        className="border-t border-white/10 text-slate-200"
                        key={`${row.frameNumber}-${row.landmarkIndex}`}
                      >
                        <td className="p-3">{row.frameNumber}</td>
                        <td className="p-3">{row.timestamp.toFixed(3)}</td>
                        <td className="p-3 font-bold">{row.landmarkName}</td>
                        <td className="p-3">{row.x}</td>
                        <td className="p-3">{row.y}</td>
                        <td className="p-3">{row.z}</td>
                        <td className="p-3">{row.visibility}</td>
                        <td className="p-3">{row.confidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        <section className="mt-8 rounded-lg border border-white/10 bg-navy-900/80 p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-volt">
                Dataset Plan
              </p>
              <h2 className="text-2xl font-black text-white">
                Validation Sources and Collection Targets
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-300">
                Public clips are only for pipeline smoke tests unless licensing
                and clip quality are verified. Product validation should be
                based on first-party side-view recordings with manual labels.
              </p>
            </div>
            <div className="rounded-md border border-amber-300/30 bg-amber-400/10 p-4 text-sm font-semibold leading-6 text-amber-50">
              Good public side-view volleyball approach data is not available
              at a quality level we should trust for AthletIQ accuracy claims.
            </div>
          </div>

          <div className="overflow-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="bg-navy-950 text-slate-300">
                <tr>
                  <th className="p-3">Source</th>
                  <th className="p-3">Contains</th>
                  <th className="p-3">Side View</th>
                  <th className="p-3">Labels</th>
                  <th className="p-3">Usage</th>
                  <th className="p-3">Usefulness</th>
                  <th className="p-3">Risks</th>
                </tr>
              </thead>
              <tbody>
                {datasetSources.map((source) => (
                  <tr
                    className="border-t border-white/10 align-top text-slate-200"
                    key={source.name}
                  >
                    <td className="p-3">
                      <a
                        className="focus-ring inline-flex items-center gap-2 font-black text-volt hover:text-white"
                        href={source.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {source.name}
                        <ExternalLink size={14} aria-hidden />
                      </a>
                    </td>
                    <td className="p-3 leading-6">{source.contains}</td>
                    <td className="p-3 leading-6">
                      {source.sideViewApproaches}
                    </td>
                    <td className="p-3 leading-6">{source.annotations}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusStyles[source.usageStatus]}`}
                      >
                        {statusLabels[source.usageStatus]}
                      </span>
                      <p className="mt-2 leading-6 text-slate-300">
                        {source.license}
                      </p>
                    </td>
                    <td className="p-3 leading-6">{source.usefulness}</td>
                    <td className="p-3 leading-6">{source.risks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <ShieldCheck className="mb-4 text-volt" size={26} aria-hidden />
            <h2 className="text-lg font-black text-white">
              First-Party Collection
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              {firstPartyCollectionTargets.map((target) => (
                <li className="border-t border-white/10 pt-3" key={target}>
                  {target}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <FileText className="mb-4 text-volt" size={26} aria-hidden />
            <h2 className="text-lg font-black text-white">
              Labeling Template
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              One row per clip. Label frames, not only timestamps, so model
              errors can be measured precisely.
            </p>
            <pre className="mt-4 max-h-80 overflow-auto rounded-lg border border-white/10 bg-navy-950 p-4 text-xs leading-6 text-slate-200">
              {labelingColumns.join(",")}
            </pre>
            <h3 className="mt-5 text-sm font-black uppercase tracking-[0.14em] text-slate-400">
              Source Log
            </h3>
            <pre className="mt-3 overflow-auto rounded-lg border border-white/10 bg-navy-950 p-4 text-xs leading-6 text-slate-200">
              {sourceLogColumns.join(",")}
            </pre>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <Database className="mb-4 text-volt" size={26} aria-hidden />
            <h2 className="text-lg font-black text-white">
              Metrics To Track
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              {validationMetrics.map((metric) => (
                <li className="border-t border-white/10 pt-3" key={metric}>
                  {metric}
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-md border border-red-300/30 bg-red-400/10 p-4 text-sm font-semibold leading-6 text-red-50">
              Do not use broadcast, YouTube, TikTok, or unclear-license video
              for product validation. Treat those as reference only.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
