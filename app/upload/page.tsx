"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Camera, CheckCircle2, FileVideo, Wand2 } from "lucide-react";
import { analyzeVideoElement } from "@/lib/analysis/browser-pose";
import { SiteHeader } from "@/components/site-header";

const instructions = [
  "Film from the side",
  "Full body visible",
  "3-5 step approach",
  "Good lighting",
];

export default function UploadPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState("");

  const canAnalyze = useMemo(
    () => Boolean(videoUrl) && !isAnalyzing,
    [videoUrl, isAnalyzing],
  );

  const handleAnalyze = async () => {
    if (!videoRef.current) return;

    setError("");
    setIsAnalyzing(true);
    setAnalysisProgress(4);

    try {
      const report = await analyzeVideoElement(videoRef.current, setAnalysisProgress);
      sessionStorage.setItem("athletiq-analysis-report", JSON.stringify(report));
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
            </div>
          ) : null}

          {isAnalyzing ? (
            <div className="mt-6 rounded-lg border border-volt/20 bg-volt/10 p-4">
              <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-100">
                <span>Analyzing pose and scoring movement</span>
                <span>{analysisProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-volt transition-all"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
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
