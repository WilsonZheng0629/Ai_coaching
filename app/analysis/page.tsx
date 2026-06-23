"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClipboardCheck, Dumbbell, RotateCcw, Trophy } from "lucide-react";
import { ScoreBar } from "@/components/score-bar";
import { SiteHeader } from "@/components/site-header";
import type { AnalysisReport } from "@/lib/analysis/types";
import { analysisReport } from "@/lib/mock-analysis";

export default function AnalysisPage() {
  const [report, setReport] = useState<AnalysisReport>(analysisReport);

  useEffect(() => {
    const savedReport = sessionStorage.getItem("athletiq-analysis-report");
    if (!savedReport) return;

    try {
      setReport(JSON.parse(savedReport) as AnalysisReport);
    } catch {
      setReport(analysisReport);
    }
  }, []);

  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-10 lg:py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-volt">
              {report.source === "pose-algorithm"
                ? "Pose-Based Analysis"
                : "Mock Analysis"}
            </p>
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              Approach Report
            </h1>
          </div>
          <Link
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-volt px-5 py-3 font-black text-navy-950 transition hover:bg-white"
            href="/upload"
          >
            <RotateCcw size={18} aria-hidden />
            Upload Another Video
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <section className="rounded-lg border border-white/10 bg-navy-900/80 p-6 shadow-glow">
            <div className="flex items-center gap-3 text-volt">
              <Trophy size={24} aria-hidden />
              <h2 className="text-lg font-black text-white">
                Overall Approach Score
              </h2>
            </div>
            <div className="mt-8 flex items-end gap-2">
              <span className="text-7xl font-black text-white">
                {report.overallScore}
              </span>
              <span className="mb-3 text-2xl font-bold text-slate-400">
                /100
              </span>
            </div>
            <p className="mt-5 leading-7 text-slate-300">
              {report.summary}
            </p>
            {report.metrics ? (
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <p className="font-bold text-slate-400">Confidence</p>
                  <p className="mt-1 text-xl font-black text-white">
                    {report.metrics.confidence}%
                  </p>
                </div>
                <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <p className="font-bold text-slate-400">Detected Steps</p>
                  <p className="mt-1 text-xl font-black text-white">
                    {report.metrics.detectedSteps}
                  </p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-6 text-lg font-black text-white">Subscores</h2>
            <div className="space-y-5">
              {report.subscores.map((item) => (
                <ScoreBar
                  key={item.label}
                  label={item.label}
                  score={item.score}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-5 flex items-center gap-3">
              <ClipboardCheck className="text-volt" size={23} aria-hidden />
              <h2 className="text-lg font-black text-white">Top 3 Fixes</h2>
            </div>
            <ol className="space-y-4">
              {report.fixes.map((fix, index) => (
                <li className="flex gap-4" key={fix}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-volt text-sm font-black text-navy-950">
                    {index + 1}
                  </span>
                  <p className="leading-7 text-slate-200">{fix}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-5 flex items-center gap-3">
              <Dumbbell className="text-volt" size={23} aria-hidden />
              <h2 className="text-lg font-black text-white">
                Recommended Drills
              </h2>
            </div>
            <ol className="space-y-4">
              {report.drills.map((drill, index) => (
                <li className="flex gap-4" key={drill}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-volt/40 text-sm font-black text-volt">
                    {index + 1}
                  </span>
                  <p className="leading-7 text-slate-200">{drill}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </section>
    </main>
  );
}
