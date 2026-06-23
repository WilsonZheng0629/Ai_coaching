import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Footprints,
  Gauge,
  Play,
  TimerReset,
  Upload,
  Zap,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const steps = [
  "Upload a side-view hitting approach video",
  "AthletIQ analyzes your movement",
  "Get your score, top fixes, and drills",
];

const benefits = [
  { icon: TimerReset, label: "Improve approach timing" },
  { icon: Footprints, label: "Fix footwork issues" },
  { icon: Zap, label: "Improve jump mechanics" },
  { icon: BarChart3, label: "Track progress over time" },
];

export default function LandingPage() {
  return (
    <main className="page-shell">
      <SiteHeader />

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
        <div className="relative z-10">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/10 px-3 py-1 text-sm font-semibold text-volt">
            <Activity size={16} aria-hidden="true" />
            Volleyball approach analysis
          </p>
          <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
            Upload your volleyball approach. Get AI-powered feedback.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
            AthletIQ helps hitters and coaches spot timing, footwork, and
            jump-mechanics issues from a simple side-view video.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-volt px-6 py-3 text-base font-black text-navy-950 transition hover:bg-white"
              href="/upload"
            >
              <Upload size={18} aria-hidden="true" />
              Try Free Analysis
            </Link>
            <Link
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-6 py-3 text-base font-bold text-white transition hover:border-volt/60 hover:bg-white/5"
              href="/dashboard"
            >
              <Gauge size={18} aria-hidden="true" />
              View Dashboard
            </Link>
          </div>
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-white/10 bg-navy-900 shadow-glow lg:min-h-[540px]">
          <Image
            src="/images/athletiq-hero.png"
            alt="Volleyball athlete performing a side-view hitting approach"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/70 via-navy-950/20 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 rounded-md border border-white/10 bg-navy-950/80 p-4 backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-slate-200">
                Approach Score
              </span>
              <span className="text-2xl font-black text-volt">72</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-2 w-[72%] rounded-full bg-volt" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-navy-900/80 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-black text-white">How It Works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                className="rounded-lg border border-white/10 bg-white/[0.03] p-6"
                key={step}
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-volt text-lg font-black text-navy-950">
                  {index + 1}
                </div>
                <p className="text-lg font-bold text-white">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-white">Why It Matters</h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Better attacking starts before takeoff. AthletIQ focuses on the
              approach details athletes can actually train.
            </p>
          </div>
          <Play className="hidden text-volt sm:block" size={34} aria-hidden />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, label }) => (
            <div
              className="rounded-lg border border-white/10 bg-white/[0.03] p-5"
              key={label}
            >
              <Icon className="mb-4 text-volt" size={26} aria-hidden="true" />
              <p className="font-bold text-white">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
