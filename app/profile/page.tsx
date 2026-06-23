"use client";

import { useEffect, useState } from "react";
import { Save, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PrototypeDisclaimer } from "@/components/analysis/prototype-disclaimer";
import { defaultAthleteProfile } from "@/lib/mockData/athletiq";
import type { AthleteProfile } from "@/lib/types";

const positions: AthleteProfile["position"][] = [
  "Outside Hitter",
  "Opposite",
  "Middle Blocker",
  "Setter",
  "Libero",
  "Defensive Specialist",
];

const skillLevels: AthleteProfile["skillLevel"][] = [
  "Beginner",
  "School Team",
  "Club",
  "Varsity",
  "College",
];

const goals: AthleteProfile["mainGoal"][] = [
  "Jump higher",
  "Hit harder",
  "Improve approach timing",
  "Improve footwork",
  "Improve consistency",
  "Improve landing control",
];

const profileFields = [
  {
    key: "firstName",
    label: "First name",
    helper: "Used to personalize the report without changing the score.",
  },
  {
    key: "age",
    label: "Age",
    helper: "Age helps compare athletes to a more relevant sample group later.",
  },
  {
    key: "gender",
    label: "Gender",
    helper:
      "Used only for future comparison groups. Scores should still be based on visible mechanics.",
  },
  {
    key: "height",
    label: "Height",
    helper:
      "Height, reach, and position help AthletIQ avoid random professional comparisons.",
  },
  {
    key: "weight",
    label: "Weight",
    helper:
      "May help coaches interpret movement context, but it should not drive conclusions by itself.",
  },
  {
    key: "standingReach",
    label: "Standing reach",
    helper:
      "Standing reach makes future max-touch comparisons more relevant.",
  },
  {
    key: "maxTouch",
    label: "Max touch",
    helper:
      "Max touch helps separate jump outcome from approach mechanics.",
  },
] as const;

export default function ProfilePage() {
  const [profile, setProfile] = useState<AthleteProfile>(defaultAthleteProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("athletiq-athlete-profile");
    if (stored) setProfile({ ...defaultAthleteProfile, ...JSON.parse(stored) });
  }, []);

  const updateProfile = (key: keyof AthleteProfile, value: string) => {
    setSaved(false);
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = () => {
    localStorage.setItem("athletiq-athlete-profile", JSON.stringify(profile));
    setSaved(true);
  };

  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-5 py-10 lg:py-16">
        <div className="mb-8">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-volt">
            Athlete Profile
          </p>
          <h1 className="text-3xl font-black text-white sm:text-4xl">
            Personalize Future Analysis
          </h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            This prototype stores profile details in your browser only. These
            fields help future comparison features match you with relevant
            athlete profiles instead of broad or misleading benchmarks.
          </p>
        </div>

        <div className="mb-6">
          <PrototypeDisclaimer />
        </div>

        <div className="rounded-lg border border-white/10 bg-navy-900/80 p-5 shadow-glow sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <UserRound className="text-volt" size={26} aria-hidden />
            <h2 className="text-xl font-black text-white">Profile Inputs</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {profileFields.map((field) => (
              <label className="block" key={field.key}>
                <span className="text-sm font-bold text-slate-100">
                  {field.label}
                </span>
                <input
                  className="focus-ring mt-2 w-full rounded-md border border-white/10 bg-navy-950 px-4 py-3 text-white"
                  value={profile[field.key]}
                  onChange={(event) =>
                    updateProfile(field.key, event.target.value)
                  }
                />
                <span className="mt-2 block text-xs leading-5 text-slate-400">
                  {field.helper}
                </span>
              </label>
            ))}

            <label className="block">
              <span className="text-sm font-bold text-slate-100">
                Dominant hand
              </span>
              <select
                className="focus-ring mt-2 w-full rounded-md border border-white/10 bg-navy-950 px-4 py-3 text-white"
                value={profile.dominantHand}
                onChange={(event) =>
                  updateProfile("dominantHand", event.target.value)
                }
              >
                <option value="">Select</option>
                <option>Right</option>
                <option>Left</option>
                <option>Both</option>
              </select>
              <span className="mt-2 block text-xs leading-5 text-slate-400">
                Dominant hand may affect arm swing timing interpretation.
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-100">Position</span>
              <select
                className="focus-ring mt-2 w-full rounded-md border border-white/10 bg-navy-950 px-4 py-3 text-white"
                value={profile.position}
                onChange={(event) =>
                  updateProfile("position", event.target.value)
                }
              >
                <option value="">Select</option>
                {positions.map((position) => (
                  <option key={position}>{position}</option>
                ))}
              </select>
              <span className="mt-2 block text-xs leading-5 text-slate-400">
                Position helps future comparisons avoid mismatched athlete
                groups.
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-100">
                Skill level
              </span>
              <select
                className="focus-ring mt-2 w-full rounded-md border border-white/10 bg-navy-950 px-4 py-3 text-white"
                value={profile.skillLevel}
                onChange={(event) =>
                  updateProfile("skillLevel", event.target.value)
                }
              >
                <option value="">Select</option>
                {skillLevels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
              <span className="mt-2 block text-xs leading-5 text-slate-400">
                Skill level should guide expectations, not exaggerate accuracy.
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-100">
                Main goal
              </span>
              <select
                className="focus-ring mt-2 w-full rounded-md border border-white/10 bg-navy-950 px-4 py-3 text-white"
                value={profile.mainGoal}
                onChange={(event) =>
                  updateProfile("mainGoal", event.target.value)
                }
              >
                <option value="">Select</option>
                {goals.map((goal) => (
                  <option key={goal}>{goal}</option>
                ))}
              </select>
              <span className="mt-2 block text-xs leading-5 text-slate-400">
                Your goal helps prioritize drill recommendations after analysis.
              </span>
            </label>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-volt px-5 py-3 font-black text-navy-950 transition hover:bg-white"
              onClick={saveProfile}
              type="button"
            >
              <Save size={18} aria-hidden />
              Save Profile
            </button>
            {saved ? (
              <p className="text-sm font-semibold text-volt">
                Profile saved in this browser.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
