"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  Search,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { proPlayers, type ProPlayer } from "@/lib/data/proPlayers";
import { defaultAthleteProfile } from "@/lib/mockData/athletiq";
import {
  findSimilarProPlayers,
  toMatchUserProfile,
  type ProPlayerMatch,
} from "@/lib/playerMatching";
import type { AthleteProfile } from "@/lib/types";

const emptyValue = "Unknown";

function formatHeight(player: ProPlayer) {
  return player.heightCm ? `${player.heightCm} cm` : emptyValue;
}

function PlayerMatchCard({ match }: { match: ProPlayerMatch }) {
  const { player } = match;

  return (
    <article className="rounded-lg border border-white/10 bg-navy-950/65 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-volt">
            {player.dataConfidence} confidence profile
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {player.fullName}
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-300">
            {player.position} · {player.nationality ?? emptyValue}
          </p>
        </div>
        <div className="rounded-md border border-volt/30 bg-volt/10 px-4 py-3 text-center">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-volt">
            Similarity
          </p>
          <p className="mt-1 text-3xl font-black text-white">
            {match.similarityScore}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <p className="font-bold text-slate-400">Height</p>
          <p className="mt-1 font-black text-white">{formatHeight(player)}</p>
        </div>
        <div>
          <p className="font-bold text-slate-400">Dominant hand</p>
          <p className="mt-1 font-black text-white">{player.dominantHand}</p>
        </div>
        <div>
          <p className="font-bold text-slate-400">National team</p>
          <p className="mt-1 font-black text-white">
            {player.nationalTeam ?? emptyValue}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="font-black text-white">Why this match makes sense</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            {match.reasonsForMatch.map((reason) => (
              <li key={reason}>- {reason}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-black text-white">What to study</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            {match.whatToStudy.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {player.studyNotes.length ? (
        <p className="mt-5 rounded-md border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
          {player.studyNotes[0]}
        </p>
      ) : null}

      <div className="mt-5">
        <h3 className="font-black text-white">Source links</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {player.sourceUrls.map((sourceUrl, index) => (
            <a
              className="focus-ring inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-bold text-slate-200 hover:border-volt/60 hover:text-white"
              href={sourceUrl}
              key={sourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              Source {index + 1}
              <ExternalLink size={14} aria-hidden />
            </a>
          ))}
        </div>
      </div>

      {player.videoStudyLinks.length ? (
        <div className="mt-5">
          <h3 className="font-black text-white">External video study links</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {player.videoStudyLinks.map((videoUrl, index) => (
              <a
                className="focus-ring inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-bold text-slate-200 hover:border-volt/60 hover:text-white"
                href={videoUrl}
                key={videoUrl}
                rel="noreferrer"
                target="_blank"
              >
                Study link {index + 1}
                <ExternalLink size={14} aria-hidden />
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-md border border-amber-300/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50">
        {match.missingDataWarnings.slice(0, 3).map((warning) => (
          <p key={warning}>{warning}</p>
        ))}
      </div>
    </article>
  );
}

export default function PlayerMatchesPage() {
  const [profile, setProfile] = useState<AthleteProfile>(defaultAthleteProfile);

  useEffect(() => {
    const stored = localStorage.getItem("athletiq-athlete-profile");
    if (!stored) return;

    try {
      setProfile({ ...defaultAthleteProfile, ...JSON.parse(stored) });
    } catch {
      setProfile(defaultAthleteProfile);
    }
  }, []);

  const matchProfile = useMemo(() => toMatchUserProfile(profile), [profile]);
  const result = useMemo(
    () => findSimilarProPlayers(matchProfile, proPlayers, 6),
    [matchProfile],
  );

  const summaryItems = [
    ["Height", profile.height || emptyValue],
    ["Position", profile.position || emptyValue],
    ["Dominant hand", profile.dominantHand || emptyValue],
    ["Skill level", profile.skillLevel || emptyValue],
    ["Goal", profile.mainGoal || emptyValue],
    ["Play style", profile.playStyle || emptyValue],
  ];

  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-10 lg:py-16">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-volt">
              <Search size={16} aria-hidden />
              Pro Player Study Match
            </p>
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              Find Pro Players Built Like You
            </h1>
            <p className="mt-3 max-w-3xl leading-7 text-slate-300">
              AthletIQ compares your profile to professional volleyball players
              using position, height, dominant hand, goals, and play-style
              traits. This is not telling you to copy a player exactly. It
              helps you find useful study references.
            </p>
          </div>
          <Link
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-volt px-5 py-3 font-black text-navy-950 transition hover:bg-white"
            href="/profile"
          >
            <UserRound size={18} aria-hidden />
            Edit Profile
          </Link>
        </div>

        <div className="mb-6 rounded-lg border border-amber-300/30 bg-amber-400/10 p-5 text-sm font-semibold leading-6 text-amber-50">
          <div className="flex gap-3">
            <ShieldAlert className="mt-1 shrink-0" size={20} aria-hidden />
            <p>
              This is currently a profile-based match. Future versions will
              compare actual movement mechanics from video. AthletIQ does not
              claim your form matches any pro.
            </p>
          </div>
        </div>

        <section className="mb-6 rounded-lg border border-white/10 bg-navy-900/80 p-5">
          <h2 className="text-lg font-black text-white">
            Your Profile Summary
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summaryItems.map(([label, value]) => (
              <div
                className="rounded-md border border-white/10 bg-white/[0.03] p-4"
                key={label}
              >
                <p className="text-sm font-bold text-slate-400">{label}</p>
                <p className="mt-1 font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          {result.matchedPlayers.map((match) => (
            <PlayerMatchCard key={match.player.id} match={match} />
          ))}
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-1 shrink-0 text-volt" size={20} />
            <div>
              <h2 className="font-black text-white">Accuracy Boundary</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                {result.warnings.map((warning) => (
                  <li key={warning}>- {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
