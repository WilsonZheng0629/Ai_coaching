"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  Dumbbell,
  RotateCcw,
  ShieldAlert,
  Trophy,
  Users,
} from "lucide-react";
import { ConfidenceBadge } from "@/components/analysis/confidence-badge";
import { PrototypeDisclaimer } from "@/components/analysis/prototype-disclaimer";
import { ScoreBar } from "@/components/score-bar";
import { SiteHeader } from "@/components/site-header";
import { UnsupportedAngleWarning } from "@/components/upload/unsupported-angle-warning";
import type { AnalysisReport } from "@/lib/analysis/types";
import { drillRecommendations, sampleComparison } from "@/lib/mockData/athletiq";
import { analysisReport } from "@/lib/mock-analysis";

function confidenceFromReport(report: AnalysisReport) {
  const score = report.metrics?.confidence ?? 55;
  if (score >= 80) return "High" as const;
  if (score >= 45) return "Medium" as const;
  return "Low" as const;
}

export default function AnalysisPage() {
  const [report, setReport] = useState<AnalysisReport>(analysisReport);
  const [cameraAngle, setCameraAngle] = useState("Side view");

  useEffect(() => {
    const savedReport = sessionStorage.getItem("athletiq-analysis-report");
    const uploadContext = sessionStorage.getItem("athletiq-upload-context");

    if (uploadContext) {
      try {
        const parsed = JSON.parse(uploadContext) as { cameraAngle?: string };
        if (parsed.cameraAngle) setCameraAngle(parsed.cameraAngle);
      } catch {
        setCameraAngle("Side view");
      }
    }

    if (!savedReport) return;

    try {
      setReport(JSON.parse(savedReport) as AnalysisReport);
    } catch {
      setReport(analysisReport);
    }
  }, []);

  const overallConfidence = confidenceFromReport(report);

  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-10 lg:py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-volt">
              {report.source === "pose-algorithm"
                ? "Prototype Estimate"
                : "Mock Prototype Estimate"}
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-volt">
                <Trophy size={24} aria-hidden />
                <h2 className="text-lg font-black text-white">
                  Approach Score
                </h2>
              </div>
              <ConfidenceBadge level={overallConfidence} />
            </div>
            <div className="mt-8 flex items-end gap-2">
              <span className="text-7xl font-black text-white">
                {report.overallScore}
              </span>
              <span className="mb-3 text-2xl font-bold text-slate-400">
                /100
              </span>
            </div>
            <p className="mt-2 text-sm font-bold text-volt">
              Prototype estimate
            </p>
            <p className="mt-5 leading-7 text-slate-300">
              {report.summary}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Reason: side-view videos are supported. Pose detection is
              connected, but the scoring model is an early heuristic and is not
              coach-validated yet.
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
                <div key={item.label}>
                  <ScoreBar label={item.label} score={item.score} />
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <p className="text-sm leading-6 text-slate-300">
                      {item.explanation ??
                        "Prototype estimate based on visible mechanics."}
                    </p>
                    <ConfidenceBadge level={item.confidence ?? overallConfidence} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6">
          <PrototypeDisclaimer />
        </div>

        {cameraAngle !== "Side view" ? (
          <div className="mt-6">
            <UnsupportedAngleWarning />
          </div>
        ) : null}

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
            <p className="mt-5 text-sm font-semibold text-amber-100">
              These are prototype observations and should be confirmed by a
              coach.
            </p>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-5 flex items-center gap-3">
              <Dumbbell className="text-volt" size={23} aria-hidden />
              <h2 className="text-lg font-black text-white">
                Recommended Drills
              </h2>
            </div>
            <div className="space-y-4">
              {drillRecommendations.map((drill) => (
                <div
                  className="rounded-lg border border-white/10 bg-navy-950/60 p-4"
                  key={drill.title}
                >
                  <h3 className="font-black text-white">{drill.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-volt">
                    {drill.purpose}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                    {drill.steps.map((step) => (
                      <li key={step}>- {step}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm font-black text-white">
                    {drill.sets}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm font-semibold text-amber-100">
              Stop if you feel pain. This is training guidance, not medical
              advice.
            </p>
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-3">
            <Users className="text-volt" size={24} aria-hidden />
            <div>
              <h2 className="text-lg font-black text-white">
                You vs Similar Athletes
              </h2>
              <p className="mt-1 text-sm font-semibold text-amber-100">
                {sampleComparison.label}
              </p>
            </div>
          </div>
          <p className="max-w-4xl leading-7 text-slate-300">
            In the future, AthletIQ will compare you to high-performing
            athletes with similar height, position, reach, age, and movement
            style. For now, this is sample data showing how the feature will
            work.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-navy-950/60 p-5">
              <h3 className="mb-4 font-black text-white">User Profile</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(sampleComparison.userProfile).map(([key, value]) => (
                  <div key={key}>
                    <p className="font-bold capitalize text-slate-400">
                      {key.replace(/([A-Z])/g, " $1")}
                    </p>
                    <p className="mt-1 font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-navy-950/60 p-5">
              <h3 className="mb-4 font-black text-white">
                Similar Athlete Group
              </h3>
              <div className="space-y-3 text-sm text-slate-300">
                <p>
                  <span className="font-black text-white">
                    {sampleComparison.group.profiles}
                  </span>{" "}
                  similar athlete profiles
                </p>
                <p>
                  Top performer average approach score:{" "}
                  <span className="font-black text-white">
                    {sampleComparison.group.topPerformerAverageApproachScore}
                  </span>
                </p>
                <p>
                  Top performer average max touch:{" "}
                  <span className="font-black text-white">
                    {sampleComparison.group.topPerformerAverageMaxTouch}
                  </span>
                </p>
                {sampleComparison.group.commonStrengths.map((strength) => (
                  <p key={strength}>Common strength: {strength}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-volt/20 bg-volt/10 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-volt">
              Biggest Gap
            </p>
            <h3 className="mt-2 text-xl font-black text-white">
              {sampleComparison.biggestGap}
            </h3>
            <p className="mt-3 leading-7 text-slate-200">
              {sampleComparison.explanation}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-navy-900/80 p-6">
          <div className="mb-5 flex items-center gap-3">
            <ShieldAlert className="text-volt" size={24} aria-hidden />
            <h2 className="text-lg font-black text-white">
              Coach Review Summary
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-bold text-slate-400">
                Athlete focus area
              </p>
              <p className="mt-1 font-black text-white">
                Penultimate step efficiency
              </p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400">Possible issue</p>
              <p className="mt-1 text-slate-200">
                The athlete may not be creating enough loading before takeoff.
              </p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400">
                Suggested coaching cue
              </p>
              <p className="mt-1 font-black text-white">
                &ldquo;Long-short, load, then explode.&rdquo;
              </p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400">
                Recommended drill
              </p>
              <p className="mt-1 text-slate-200">
                Penultimate Step Rhythm Drill
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ConfidenceBadge level={overallConfidence} />
            <p className="text-sm font-semibold text-amber-100">
              Prototype analysis. Coach review recommended.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
