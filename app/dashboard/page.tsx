"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Crosshair,
  Dumbbell,
  Medal,
  Target,
  Upload,
  Video,
} from "lucide-react";
import { PrototypeDisclaimer } from "@/components/analysis/prototype-disclaimer";
import { ScoreBar } from "@/components/score-bar";
import { SiteHeader } from "@/components/site-header";
import { drillRecommendations } from "@/lib/mockData/athletiq";

type DashboardSession = {
  totalUploads: number;
  latestScore: number | null;
  bestScore: number | null;
  focusArea: string | null;
  scores: number[];
};

const emptySession: DashboardSession = {
  totalUploads: 0,
  latestScore: null,
  bestScore: null,
  focusArea: null,
  scores: [],
};

const formatValue = (value: string | number | null) =>
  value === null || value === "" ? "—" : value;

const exerciseBlocks = [
  {
    title: "Warm-Up Prep",
    items: [
      "5 minutes easy movement",
      "Dynamic hips, ankles, and calves",
      "3 slow approach walk-throughs",
    ],
  },
  {
    title: "Approach Quality",
    items: [
      "3 sets of 5 controlled approaches",
      "Film 1 set from the side",
      "Check feet stay visible through landing",
    ],
  },
  {
    title: "Jump Care",
    items: [
      "Stop if pain shows up",
      "Land quietly with knees tracking over toes",
      "Rest 60-90 seconds between max jumps",
    ],
  },
];

export default function DashboardPage() {
  const [session, setSession] = useState<DashboardSession>(emptySession);

  useEffect(() => {
    const stored = sessionStorage.getItem("athletiq-dashboard-session");
    if (!stored) return;

    try {
      setSession({ ...emptySession, ...JSON.parse(stored) });
    } catch {
      setSession(emptySession);
    }
  }, []);

  const statCards = useMemo(
    () => [
      {
        label: "Session Uploads",
        value: session.totalUploads,
        icon: Video,
      },
      {
        label: "Latest Score",
        value: session.latestScore,
        icon: BarChart3,
      },
      {
        label: "Best Session Score",
        value: session.bestScore,
        icon: Medal,
      },
      {
        label: "Current Focus Area",
        value: session.focusArea,
        icon: Target,
      },
      {
        label: "Next Action",
        value: session.totalUploads ? "Train and re-film" : "Upload a video",
        icon: Crosshair,
      },
    ],
    [session],
  );

  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-10 lg:py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-volt">
              Session Dashboard
            </p>
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              Athlete Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              This view resets when your browser session ends. Use it as a
              lightweight training board after each prototype analysis.
            </p>
          </div>
          <Link
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-volt px-5 py-3 font-black text-navy-950 transition hover:bg-white"
            href="/upload"
          >
            <Upload size={18} aria-hidden />
            Upload Video
          </Link>
        </div>

        <div className="mb-6">
          <PrototypeDisclaimer />
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {statCards.map(({ label, value, icon: Icon }) => (
            <div
              className="rounded-lg border border-white/10 bg-navy-900/80 p-6"
              key={label}
            >
              <Icon className="mb-5 text-volt" size={26} aria-hidden />
              <p className="text-sm font-bold text-slate-400">{label}</p>
              <p className="mt-2 text-2xl font-black text-white">
                {formatValue(value)}
              </p>
            </div>
          ))}
        </div>

        {session.scores.length ? (
          <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-6 text-lg font-black text-white">
              This Session&apos;s Uploads
            </h2>
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-5">
                {session.scores.map((score, index) => (
                  <ScoreBar
                    key={`${score}-${index}`}
                    label={`Upload ${index + 1}`}
                    score={score}
                  />
                ))}
              </div>
              <div className="flex min-h-[220px] items-end gap-4 rounded-lg border border-white/10 bg-navy-950/70 p-5">
                {session.scores.map((score, index) => (
                  <div
                    className="flex flex-1 flex-col items-center"
                    key={`${score}-bar-${index}`}
                  >
                    <div
                      className="w-full rounded-t-md bg-volt"
                      style={{ height: `${Math.max(18, score * 2)}px` }}
                      aria-label={`Upload ${index + 1}: ${score}`}
                    />
                    <p className="mt-3 text-xs font-bold text-slate-300">
                      {index + 1}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-lg border border-volt/20 bg-volt/10 p-6">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-volt">
              No Session Uploads Yet
            </p>
            <p className="mt-3 max-w-3xl text-lg font-bold leading-8 text-white">
              Upload a side-view approach video to populate this dashboard for
              the current session.
            </p>
          </section>
        )}

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-white/10 bg-navy-900/80 p-6">
            <div className="mb-5 flex items-center gap-3">
              <Dumbbell className="text-volt" size={24} aria-hidden />
              <h2 className="text-lg font-black text-white">
                Exercises To Do Next
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
                  <p className="mt-3 text-sm font-black text-white">
                    {drill.sets}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-black text-white">
              Training Checklist
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {exerciseBlocks.map((block) => (
                <div
                  className="rounded-lg border border-white/10 bg-navy-950/60 p-4"
                  key={block.title}
                >
                  <h3 className="font-black text-white">{block.title}</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                    {block.items.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm font-semibold text-amber-100">
              These are general training prompts, not medical advice. Coach
              review recommended.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
