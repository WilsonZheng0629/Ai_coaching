import Link from "next/link";
import { BarChart3, Medal, Upload, Video } from "lucide-react";
import { ScoreBar } from "@/components/score-bar";
import { SiteHeader } from "@/components/site-header";
import { dashboardStats } from "@/lib/mock-analysis";

const statCards = [
  {
    label: "Total Uploads",
    value: dashboardStats.totalUploads,
    icon: Video,
  },
  {
    label: "Latest Score",
    value: dashboardStats.latestScore,
    icon: BarChart3,
  },
  {
    label: "Best Score",
    value: dashboardStats.bestScore,
    icon: Medal,
  },
];

export default function DashboardPage() {
  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-10 lg:py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-volt">
              Progress Tracking
            </p>
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              Athlete Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              A simple preview of how AthletIQ could track improvement across
              multiple hitting approach uploads.
            </p>
          </div>
          <Link
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-volt px-5 py-3 font-black text-navy-950 transition hover:bg-white"
            href="/upload"
          >
            <Upload size={18} aria-hidden />
            New Upload
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map(({ label, value, icon: Icon }) => (
            <div
              className="rounded-lg border border-white/10 bg-navy-900/80 p-6"
              key={label}
            >
              <Icon className="mb-5 text-volt" size={26} aria-hidden />
              <p className="text-sm font-bold text-slate-400">{label}</p>
              <p className="mt-2 text-4xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-6 text-lg font-black text-white">
            Approach Score Progress
          </h2>
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-5">
              {dashboardStats.progress.map((week) => (
                <ScoreBar
                  key={week.week}
                  label={week.week}
                  score={week.score}
                />
              ))}
            </div>
            <div className="flex min-h-[220px] items-end gap-4 rounded-lg border border-white/10 bg-navy-950/70 p-5">
              {dashboardStats.progress.map((week) => (
                <div className="flex flex-1 flex-col items-center" key={week.week}>
                  <div
                    className="w-full rounded-t-md bg-volt"
                    style={{ height: `${week.score * 2}px` }}
                    aria-label={`${week.week}: ${week.score}`}
                  />
                  <p className="mt-3 text-xs font-bold text-slate-300">
                    {week.week}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
