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
  "JV",
  "Club",
  "Varsity",
  "D3",
  "D2",
  "D1",
  "Pro",
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
    key: "weight",
    label: "Weight",
    helper:
      "May help coaches interpret movement context, but it should not drive conclusions by itself.",
  },
] as const;

const formatHeight = (heightCm: number) => {
  const totalInches = Math.round(heightCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${heightCm} cm (${feet}'${inches}")`;
};

const parseMeasurementNumber = (value: string) => {
  const numeric = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? String(numeric) : "";
};

const parseMeasurementUnit = (value: string) =>
  value.toLowerCase().includes("cm") ? "cm" : "in";

const measurementValue = (value: string, fallback = "") =>
  value ? parseMeasurementNumber(value) : fallback;

const withUnit = (value: string, unit: "in" | "cm") =>
  value ? `${value} ${unit}` : "";

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

  const heightCm = Number(parseMeasurementNumber(profile.height)) || 170;
  const standingReachUnit = parseMeasurementUnit(profile.standingReach);
  const maxTouchUnit = parseMeasurementUnit(profile.maxTouch);

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
              <span className="text-sm font-bold text-slate-100">Age</span>
              <input
                className="focus-ring mt-2 w-full rounded-md border border-white/10 bg-navy-950 px-4 py-3 text-white"
                max={100}
                min={5}
                type="number"
                value={profile.age}
                onChange={(event) =>
                  updateProfile(
                    "age",
                    event.target.value
                      ? String(Math.min(100, Number(event.target.value)))
                      : "",
                  )
                }
              />
              <span className="mt-2 block text-xs leading-5 text-slate-400">
                Age is capped at 100 and only helps future comparison groups.
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-100">Gender</span>
              <select
                className="focus-ring mt-2 w-full rounded-md border border-white/10 bg-navy-950 px-4 py-3 text-white"
                value={profile.gender}
                onChange={(event) =>
                  updateProfile("gender", event.target.value)
                }
              >
                <option value="">Select</option>
                <option>Female</option>
                <option>Male</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </select>
              <span className="mt-2 block text-xs leading-5 text-slate-400">
                Used only for comparison groups. Mechanics scoring still comes
                from the video.
              </span>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-slate-100">Height</span>
              <div className="mt-2 rounded-md border border-white/10 bg-navy-950 px-4 py-4">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="text-sm font-bold text-slate-300">
                    120 cm
                  </span>
                  <span className="text-lg font-black text-white">
                    {formatHeight(heightCm)}
                  </span>
                  <span className="text-sm font-bold text-slate-300">
                    230 cm
                  </span>
                </div>
                <input
                  className="w-full accent-[#2df6c8]"
                  max={230}
                  min={120}
                  type="range"
                  value={heightCm}
                  onChange={(event) =>
                    updateProfile("height", `${event.target.value} cm`)
                  }
                />
              </div>
              <span className="mt-2 block text-xs leading-5 text-slate-400">
                Height, reach, and position help AthletIQ avoid random
                professional comparisons.
              </span>
            </label>

            <div className="block">
              <span className="text-sm font-bold text-slate-100">
                Standing reach
              </span>
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                <input
                  className="focus-ring w-full rounded-md border border-white/10 bg-navy-950 px-4 py-3 text-white"
                  min={1}
                  placeholder="Example: 90"
                  type="number"
                  value={measurementValue(profile.standingReach)}
                  onChange={(event) =>
                    updateProfile(
                      "standingReach",
                      withUnit(event.target.value, standingReachUnit),
                    )
                  }
                />
                <select
                  className="focus-ring rounded-md border border-white/10 bg-navy-950 px-3 py-3 text-white"
                  value={standingReachUnit}
                  onChange={(event) =>
                    updateProfile(
                      "standingReach",
                      withUnit(
                        measurementValue(profile.standingReach),
                        event.target.value as "in" | "cm",
                      ),
                    )
                  }
                >
                  <option value="in">in</option>
                  <option value="cm">cm</option>
                </select>
              </div>
              <span className="mt-2 block text-xs leading-5 text-slate-400">
                Required format is a number plus inches or centimeters.
              </span>
            </div>

            <div className="block">
              <span className="text-sm font-bold text-slate-100">
                Max touch
              </span>
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                <input
                  className="focus-ring w-full rounded-md border border-white/10 bg-navy-950 px-4 py-3 text-white"
                  min={1}
                  placeholder="Example: 118"
                  type="number"
                  value={measurementValue(profile.maxTouch)}
                  onChange={(event) =>
                    updateProfile(
                      "maxTouch",
                      withUnit(event.target.value, maxTouchUnit),
                    )
                  }
                />
                <select
                  className="focus-ring rounded-md border border-white/10 bg-navy-950 px-3 py-3 text-white"
                  value={maxTouchUnit}
                  onChange={(event) =>
                    updateProfile(
                      "maxTouch",
                      withUnit(
                        measurementValue(profile.maxTouch),
                        event.target.value as "in" | "cm",
                      ),
                    )
                  }
                >
                  <option value="in">in</option>
                  <option value="cm">cm</option>
                </select>
              </div>
              <span className="mt-2 block text-xs leading-5 text-slate-400">
                Max touch helps separate jump outcome from approach mechanics.
              </span>
            </div>

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

            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-slate-100">
                Play style
              </span>
              <input
                className="focus-ring mt-2 w-full rounded-md border border-white/10 bg-navy-950 px-4 py-3 text-white"
                placeholder="Example: explosive jumper, left-handed attacker, serve receive anchor"
                value={profile.playStyle}
                onChange={(event) =>
                  updateProfile("playStyle", event.target.value)
                }
              />
              <span className="mt-2 block text-xs leading-5 text-slate-400">
                Optional. Leave this blank if you are too new to know your play
                style yet.
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
