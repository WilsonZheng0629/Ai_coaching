"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileVideo,
  ScanLine,
  Wand2,
} from "lucide-react";
import { analyzeVideoElement } from "@/lib/analysis/browser-pose";
import { UnsupportedAngleWarning } from "@/components/upload/unsupported-angle-warning";
import { SiteHeader } from "@/components/site-header";

const instructions = [
  "Full body visible",
  "Film from the side",
  "Camera does not move",
  "Athlete performs a 3-step, 4-step, or 5-step approach",
  "Good lighting",
  "Feet visible",
  "Takeoff and landing visible",
];

const analysisStages = [
  { at: 0, label: "Preparing video" },
  { at: 8, label: "Loading pose model" },
  { at: 20, label: "Sampling approach frames" },
  { at: 45, label: "Detecting body landmarks" },
  { at: 68, label: "Checking footwork and takeoff" },
  { at: 88, label: "Building coaching report" },
];

type DashboardSession = {
  totalUploads: number;
  latestScore: number | null;
  bestScore: number | null;
  focusArea: string | null;
  scores: number[];
};

function updateDashboardSession(overallScore: number, focusArea: string | null) {
  const stored = sessionStorage.getItem("athletiq-dashboard-session");
  const current: DashboardSession = stored
    ? JSON.parse(stored)
    : {
        totalUploads: 0,
        latestScore: null,
        bestScore: null,
        focusArea: null,
        scores: [],
      };
  const scores = [...current.scores, overallScore].slice(-6);
  sessionStorage.setItem(
    "athletiq-dashboard-session",
    JSON.stringify({
      totalUploads: current.totalUploads + 1,
      latestScore: overallScore,
      bestScore: Math.max(current.bestScore ?? 0, overallScore),
      focusArea,
      scores,
    } satisfies DashboardSession),
  );
}

export default function UploadPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [videoType, setVideoType] = useState("Hitting approach");
  const [cameraAngle, setCameraAngle] = useState("Side view");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState("");

  const canAnalyze = useMemo(
    () => Boolean(videoUrl) && !isAnalyzing,
    [videoUrl, isAnalyzing],
  );
  const activeStage = analysisStages
    .filter((stage) => analysisProgress >= stage.at)
    .at(-1);

  const handleAnalyze = async () => {
    if (!videoRef.current) return;

    setError("");
    setIsAnalyzing(true);
    setAnalysisProgress(4);

    try {
      const report = await analyzeVideoElement(videoRef.current, setAnalysisProgress);
      sessionStorage.setItem("athletiq-analysis-report", JSON.stringify(report));
      const lowestSubscore = [...report.subscores].sort(
        (left, right) => left.score - right.score,
      )[0];
      updateDashboardSession(report.overallScore, lowestSubscore?.label ?? null);
      sessionStorage.setItem(
        "athletiq-upload-context",
        JSON.stringify({ cameraAngle, videoType }),
      );
      router.push("/analysis");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Analysis failed. Try a shorter, clearer side-view video.",
      );
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
        <aside className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-volt/15 text-volt">
            <Camera size={26} aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-black text-white">Upload Your Video</h1>
          <p className="mt-3 leading-7 text-slate-300">
            Use a clean side view so the approach rhythm, footwork, arm swing,
            and takeoff are easy to evaluate.
          </p>
          <div className="mt-6 rounded-lg border border-volt/20 bg-volt/10 p-4 text-sm leading-6 text-slate-100">
            For the most accurate prototype result, use a side-view video. Other
            angles may reduce confidence.
          </div>
          <div className="mt-8 space-y-3">
            {instructions.map((item) => (
              <div className="flex items-center gap-3" key={item}>
                <CheckCircle2 className="text-volt" size={19} aria-hidden />
                <span className="text-sm font-semibold text-slate-200">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </aside>

        <div className="rounded-lg border border-white/10 bg-navy-900/80 p-5 shadow-glow sm:p-7">
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="text-sm font-bold text-slate-100">
                Video type
              </span>
              <select
                className="focus-ring mt-2 w-full rounded-md border border-white/10 bg-navy-950 px-4 py-3 text-white"
                value={videoType}
                onChange={(event) => setVideoType(event.target.value)}
              >
                <option>Hitting approach</option>
              </select>
            </label>

            <label>
              <span className="text-sm font-bold text-slate-100">
                Camera angle
              </span>
              <select
                className="focus-ring mt-2 w-full rounded-md border border-white/10 bg-navy-950 px-4 py-3 text-white"
                value={cameraAngle}
                onChange={(event) => setCameraAngle(event.target.value)}
              >
                <option>Side view</option>
                <option>Front view</option>
                <option>Back view</option>
              </select>
              <span className="mt-2 block text-xs font-semibold text-volt">
                Side view is supported for V1.
              </span>
            </label>
          </div>

          {cameraAngle !== "Side view" ? (
            <div className="mb-6">
              <UnsupportedAngleWarning />
            </div>
          ) : null}

          <label
            className="focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-volt flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-navy-950/70 p-6 text-center transition hover:border-volt/60"
            htmlFor="video-upload"
          >
            <FileVideo className="mb-4 text-volt" size={44} aria-hidden />
            <span className="text-lg font-black text-white">
              Choose a volleyball approach video
            </span>
            <span className="mt-2 text-sm text-slate-400">
              MP4, MOV, or WebM works for this prototype
            </span>
            <input
              accept="video/*"
              className="sr-only"
              id="video-upload"
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (videoUrl) URL.revokeObjectURL(videoUrl);
                setFileName(file.name);
                setVideoUrl(URL.createObjectURL(file));
                setError("");
                setAnalysisProgress(0);
              }}
            />
          </label>

          {videoUrl ? (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="truncate text-sm font-bold text-slate-200">
                  {fileName}
                </p>
                <span className="rounded-full bg-volt/15 px-3 py-1 text-xs font-black text-volt">
                  Ready
                </span>
              </div>
              <video
                ref={videoRef}
                className="aspect-video w-full rounded-lg border border-white/10 bg-black object-contain"
                controls
                src={videoUrl}
              />
              <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
                  <AlertTriangle className="text-volt" size={18} aria-hidden />
                  Checklist Confirmation
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {instructions.map((item) => (
                    <label
                      className="flex items-center gap-2 text-sm font-semibold text-slate-200"
                      key={item}
                    >
                      <input
                        className="h-4 w-4 accent-[#2df6c8]"
                        defaultChecked={
                          item !== "Film from the side" ||
                          cameraAngle === "Side view"
                        }
                        type="checkbox"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {isAnalyzing ? (
            <div className="mt-6 rounded-lg border border-volt/20 bg-volt/10 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-volt text-navy-950">
                    <ScanLine className="animate-pulse" size={20} aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">
                      Analyzing pose and scoring movement
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-300">
                      {activeStage?.label ?? "Preparing video"}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-black text-volt">
                  {analysisProgress}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-volt transition-all"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {analysisStages.slice(1).map((stage) => {
                  const isComplete = analysisProgress >= stage.at;
                  return (
                    <div
                      className={`rounded-md border p-3 text-sm font-semibold ${
                        isComplete
                          ? "border-volt/40 bg-volt/10 text-white"
                          : "border-white/10 bg-navy-950/60 text-slate-400"
                      }`}
                      key={stage.label}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        {isComplete ? (
                          <CheckCircle2 size={16} aria-hidden />
                        ) : (
                          <Activity size={16} aria-hidden />
                        )}
                        <span>{stage.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs font-semibold leading-5 text-slate-300">
                AthletIQ is reading frames in your browser. Nothing is uploaded
                to a backend in this prototype.
              </p>
            </div>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
              {error}
            </p>
          ) : null}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Link
              className="focus-ring inline-flex items-center justify-center rounded-md border border-white/15 px-5 py-3 font-bold text-white transition hover:border-volt/60 hover:bg-white/5"
              href="/"
            >
              Back
            </Link>
            <button
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-volt px-5 py-3 font-black text-navy-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
              disabled={!canAnalyze}
              onClick={handleAnalyze}
              type="button"
            >
              <Wand2 size={18} aria-hidden />
              {isAnalyzing ? "Analyzing..." : "Generate Analysis"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
