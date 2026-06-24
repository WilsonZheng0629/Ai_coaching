"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Filter,
  Search,
  ShieldAlert,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import {
  generateSearchQueries,
  sampleVideoSourcingRecords,
  type VideoSourcingRecord,
} from "@/lib/videoSourcing";

type FilterKey =
  | "first-party"
  | "public-link"
  | "side-view"
  | "smoke-test"
  | "permission-granted"
  | "needs-review";

const filterOptions: { key: FilterKey; label: string }[] = [
  { key: "first-party", label: "First-party only" },
  { key: "public-link", label: "Public links only" },
  { key: "side-view", label: "Side-view only" },
  { key: "smoke-test", label: "Usable for smoke test" },
  { key: "permission-granted", label: "Permission granted" },
  { key: "needs-review", label: "Needs review" },
];

const statusStyles = {
  yes: "border-emerald-300/40 bg-emerald-400/10 text-emerald-100",
  no: "border-red-300/40 bg-red-400/10 text-red-100",
  unknown: "border-amber-300/40 bg-amber-400/10 text-amber-100",
};

const useCaseStyles = {
  "smoke-test": "border-sky-300/40 bg-sky-400/10 text-sky-100",
  validation: "border-emerald-300/40 bg-emerald-400/10 text-emerald-100",
  "training-data": "border-purple-300/40 bg-purple-400/10 text-purple-100",
  "do-not-use": "border-red-300/40 bg-red-400/10 text-red-100",
};

function toggleFilter(filters: FilterKey[], filter: FilterKey) {
  return filters.includes(filter)
    ? filters.filter((item) => item !== filter)
    : [...filters, filter];
}

function matchesFilters(record: VideoSourcingRecord, filters: FilterKey[]) {
  return filters.every((filter) => {
    if (filter === "first-party") return record.sourceType === "first-party";
    if (filter === "public-link") return record.sourceType === "public-link";
    if (filter === "side-view") return record.cameraAngle === "side";
    if (filter === "smoke-test") return record.useCase === "smoke-test";
    if (filter === "permission-granted") {
      return record.permissionStatus === "permission-granted";
    }
    return record.manualLabelStatus === "needs-review";
  });
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-100">
        {value}
      </p>
    </div>
  );
}

function ChecklistBadge({
  label,
  value,
}: {
  label: string;
  value: "yes" | "no" | "unknown";
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm font-bold ${statusStyles[value]}`}
    >
      <span>{label}</span>
      <span className="uppercase">{value}</span>
    </div>
  );
}

function RecordCard({ record }: { record: VideoSourcingRecord }) {
  const checklist = [
    ["Full body visible", record.fullBodyVisible],
    ["Feet visible", record.feetVisible],
    ["Side view", record.cameraAngle === "side" ? "yes" : "no"],
    ["Takeoff visible", record.takeoffVisible],
    ["Landing visible", record.landingVisible],
    ["Camera stable", record.cameraStable],
    [
      "Good lighting",
      record.lightingQuality === "high" || record.lightingQuality === "medium"
        ? "yes"
        : record.lightingQuality === "low"
          ? "no"
          : "unknown",
    ],
    [
      "Permission verified",
      record.permissionStatus === "permission-granted" ? "yes" : "unknown",
    ],
  ] as const;

  return (
    <article className="rounded-lg border border-white/10 bg-navy-900/80 p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-amber-300/40 bg-amber-400/10 px-2 py-1 text-xs font-black uppercase tracking-[0.12em] text-amber-100">
              SAMPLE DATA
            </span>
            <span
              className={`rounded-md border px-2 py-1 text-xs font-black uppercase tracking-[0.12em] ${useCaseStyles[record.useCase]}`}
            >
              {record.useCase}
            </span>
          </div>
          <h2 className="text-xl font-black text-white">{record.id}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            {record.notes}
          </p>
        </div>
        <a
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-black text-white transition hover:border-volt hover:text-volt"
          href={record.sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          Source <ExternalLink size={15} aria-hidden />
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Field label="Source Type" value={record.sourceType} />
        <Field label="Video URL" value={record.videoUrl} />
        <Field label="Athlete" value={record.athleteName} />
        <Field label="Position" value={record.position} />
        <Field label="Gender" value={record.gender} />
        <Field label="Handedness" value={record.handedness} />
        <Field label="Camera Angle" value={record.cameraAngle} />
        <Field label="Video Quality" value={record.videoQuality} />
        <Field label="Lighting" value={record.lightingQuality} />
        <Field label="Permission" value={record.permissionStatus} />
        <Field label="Manual Labels" value={record.manualLabelStatus} />
        <Field label="Created" value={record.createdAt} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <ClipboardCheck className="text-volt" size={18} aria-hidden />
            <h3 className="font-black text-white">Review Checklist</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {checklist.map(([label, value]) => (
              <ChecklistBadge key={label} label={label} value={value} />
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-navy-950/60 p-4">
          <h3 className="mb-4 font-black text-white">Manual Label Section</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Overall approach quality"
              value={record.manualLabel.overallApproachQuality}
            />
            <Field label="Main issue" value={record.manualLabel.mainIssue} />
            <Field
              label="Recommended cue"
              value={record.manualLabel.recommendedCue || "unknown"}
            />
            <Field
              label="Recommended drill"
              value={record.manualLabel.recommendedDrill || "unknown"}
            />
            <Field
              label="Label confidence"
              value={record.manualLabel.labelConfidence}
            />
          </div>
        </section>
      </div>
    </article>
  );
}

export default function VideoSourcingPage() {
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);
  const queries = useMemo(() => generateSearchQueries(), []);
  const filteredRecords = useMemo(
    () =>
      sampleVideoSourcingRecords.filter((record) =>
        matchesFilters(record, activeFilters),
      ),
    [activeFilters],
  );

  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 lg:py-14">
        <div className="mb-6 rounded-lg border border-red-300/40 bg-red-400/10 p-4 text-red-50">
          <div className="flex gap-3">
            <ShieldAlert className="mt-1 shrink-0 text-red-200" aria-hidden />
            <p className="font-bold leading-7">
              Public clips are for pipeline smoke testing only. Do not use them
              as product validation or training data unless licensing,
              permission, and clip quality are verified.
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-volt">
              Video Sourcing
            </p>
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              Volleyball Approach Review Tracker
            </h1>
            <p className="mt-3 max-w-3xl leading-7 text-slate-300">
              Organize public candidate links and first-party submissions before
              anything touches AthletIQ validation. This page tracks review
              status, permission, visual quality, and manual labels.
            </p>
          </div>
          <div className="rounded-lg border border-amber-300/40 bg-amber-400/10 p-4 text-sm font-bold leading-6 text-amber-50">
            The 10 records below are SAMPLE DATA only. They are placeholders,
            not real athletes, not real clips, and not product evidence.
          </div>
        </div>

        <section className="mb-6 rounded-lg border border-white/10 bg-navy-900/80 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="text-volt" size={20} aria-hidden />
            <h2 className="text-lg font-black text-white">Filters</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {filterOptions.map((filter) => {
              const isActive = activeFilters.includes(filter.key);
              return (
                <button
                  className={`focus-ring rounded-md border px-4 py-2 text-sm font-black transition ${
                    isActive
                      ? "border-volt bg-volt text-navy-950"
                      : "border-white/15 bg-navy-950/70 text-slate-200 hover:border-volt hover:text-volt"
                  }`}
                  key={filter.key}
                  onClick={() =>
                    setActiveFilters((filters) =>
                      toggleFilter(filters, filter.key),
                    )
                  }
                  type="button"
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-400">
            Showing {filteredRecords.length} of{" "}
            {sampleVideoSourcingRecords.length} sample records.
          </p>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {filteredRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>

          <aside className="space-y-5">
            <section className="rounded-lg border border-white/10 bg-navy-900/80 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Search className="text-volt" size={20} aria-hidden />
                <h2 className="text-lg font-black text-white">
                  Search Queries
                </h2>
              </div>
              <p className="mb-4 text-sm leading-6 text-slate-300">
                The query generator only suggests searches and candidate
                tracking structure. It does not download, scrape, or store
                videos.
              </p>
              <div className="space-y-2">
                {queries.map((query) => (
                  <div
                    className="rounded-md border border-white/10 bg-navy-950/70 p-3 text-sm font-semibold text-slate-100"
                    key={query}
                  >
                    {query}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-navy-900/80 p-5">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-volt" size={20} aria-hidden />
                <h2 className="text-lg font-black text-white">
                  Collect 50 Safely
                </h2>
              </div>
              <ol className="space-y-3 text-sm font-semibold leading-6 text-slate-300">
                <li>
                  1. Start with 10 first-party side-view clips with explicit
                  permission and visible feet, takeoff, peak, and landing.
                </li>
                <li>
                  2. Add public links only as smoke-test candidates. Store the
                  URL and notes, not the video file.
                </li>
                <li>
                  3. Mark unclear licenses, poor angles, missing feet, or
                  unstable cameras as do-not-use or needs-review.
                </li>
                <li>
                  4. Expand toward 50 by prioritizing first-party recordings
                  across positions, skill levels, genders, and handedness.
                </li>
                <li>
                  5. Manually label approach start, penultimate step, plant
                  step, takeoff, peak jump, and landing before validation.
                </li>
              </ol>
            </section>

            <section className="rounded-lg border border-amber-300/40 bg-amber-400/10 p-5">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="text-amber-100" size={20} />
                <h2 className="text-lg font-black text-amber-50">
                  Use-Case Rule
                </h2>
              </div>
              <p className="text-sm font-semibold leading-6 text-amber-50">
                Public-link-only records should stay smoke-test or do-not-use.
                Validation and training-data require verified permission,
                quality review, and manual labels.
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
