import type {
  DominantHand,
  PlayStyleTag,
  ProPlayer,
  ProPlayerGender,
  ProPlayerPosition,
} from "@/lib/data/proPlayers";
import type { AthleteProfile } from "@/lib/types";

export type MatchUserProfile = {
  heightCm: number | null;
  weightKg: number | null;
  position: ProPlayerPosition | null;
  dominantHand: DominantHand;
  gender: ProPlayerGender | null;
  age: number | null;
  skillLevel: string | null;
  standingReachCm: number | null;
  maxTouchCm: number | null;
  mainGoal: string | null;
  playStyleTags: PlayStyleTag[];
};

export type ProPlayerMatch = {
  player: ProPlayer;
  similarityScore: number;
  reasonsForMatch: string[];
  whatToStudy: string[];
  missingDataWarnings: string[];
};

export type PlayerMatchResult = {
  matchedPlayers: ProPlayerMatch[];
  warnings: string[];
};

export type MovementProfile = {
  approachRhythmScore: number | null;
  penultimateStepScore: number | null;
  armSwingTimingScore: number | null;
  takeoffMechanicsScore: number | null;
  landingControlScore: number | null;
  torsoAngleAtTakeoff: number | null;
  kneeFlexionAtPlant: number | null;
  armSwingStartTiming: number | null;
  stepTimingPattern: string | null;
};

const positionWeight = 30;
const heightWeight = 25;
const handWeight = 15;
const styleWeight = 20;
const reachWeight = 10;

const goalTagMap: Record<string, PlayStyleTag[]> = {
  "Jump higher": ["explosive jumper", "high contact point"],
  "Hit harder": ["power hitter", "fast arm swing"],
  "Improve approach timing": ["transition attacker", "quick tempo attacker"],
  "Improve footwork": ["transition attacker", "serve receive anchor"],
  "Improve consistency": ["technical hitter", "serve receive anchor"],
  "Improve landing control": ["defensive specialist", "strong blocker"],
};

const studyByTag: Record<PlayStyleTag, string> = {
  "explosive jumper": "Approach rhythm and vertical loading",
  "high contact point": "Contact height and takeoff posture",
  "fast arm swing": "Arm swing timing",
  "power hitter": "Power approach sequencing",
  "technical hitter": "Shot selection and controlled approach tempo",
  "sharp angle hitter": "Shoulder line and angle creation",
  "line hitter": "Line attack setup",
  "tooling specialist": "Hands-aware attacking choices",
  "quick tempo attacker": "First-step speed and attack timing",
  "transition attacker": "Transition footwork into the approach",
  "strong blocker": "Blocking posture and first-step discipline",
  "defensive specialist": "Court coverage and body control",
  "serve receive anchor": "Serve receive to attack transition",
  "left-handed attacker": "Left-handed approach and arm swing reference",
  "undersized attacker": "Timing and explosiveness for shorter attackers",
  "tall physical attacker": "Long-frame approach control",
};

function parseMeasurementToCm(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;

  const feetMatch = normalized.match(/(\d+)\s*(?:'|ft)\s*(\d+)?/);
  if (feetMatch) {
    const feet = Number(feetMatch[1]);
    const inches = Number(feetMatch[2] ?? 0);
    return Math.round((feet * 12 + inches) * 2.54);
  }

  const cmMatch = normalized.match(/(\d+(?:\.\d+)?)\s*cm/);
  if (cmMatch) return Math.round(Number(cmMatch[1]));

  const inchesMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:in|")/);
  if (inchesMatch) return Math.round(Number(inchesMatch[1]) * 2.54);

  const numeric = Number(normalized.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return numeric > 100 ? Math.round(numeric) : Math.round(numeric * 2.54);
}

function parseNumber(value: string) {
  const numeric = Number(value.trim().replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function normalizeGender(value: string): ProPlayerGender | null {
  const normalized = value.trim().toLowerCase();
  if (["male", "men", "boy"].includes(normalized)) return "Men";
  if (["female", "women", "girl"].includes(normalized)) return "Women";
  return null;
}

function normalizeDominantHand(value: string): DominantHand {
  if (value === "Right" || value === "Left") return value;
  return "Unknown";
}

function normalizePosition(value: string): ProPlayerPosition | null {
  const allowed: ProPlayerPosition[] = [
    "Outside Hitter",
    "Opposite",
    "Middle Blocker",
    "Setter",
    "Libero",
    "Defensive Specialist",
  ];
  return allowed.includes(value as ProPlayerPosition)
    ? (value as ProPlayerPosition)
    : null;
}

function normalizePlayStyleTags(value?: string): PlayStyleTag[] {
  if (!value) return [];
  const allowed: PlayStyleTag[] = [
    "explosive jumper",
    "high contact point",
    "fast arm swing",
    "power hitter",
    "technical hitter",
    "sharp angle hitter",
    "line hitter",
    "tooling specialist",
    "quick tempo attacker",
    "transition attacker",
    "strong blocker",
    "defensive specialist",
    "serve receive anchor",
    "left-handed attacker",
    "undersized attacker",
    "tall physical attacker",
  ];
  const normalized = value.toLowerCase();
  return allowed.filter((tag) => normalized.includes(tag));
}

export function toMatchUserProfile(profile: AthleteProfile): MatchUserProfile {
  return {
    heightCm: parseMeasurementToCm(profile.height),
    weightKg: parseNumber(profile.weight),
    position: normalizePosition(profile.position),
    dominantHand: normalizeDominantHand(profile.dominantHand),
    gender: normalizeGender(profile.gender),
    age: parseNumber(profile.age),
    skillLevel: profile.skillLevel || null,
    standingReachCm: parseMeasurementToCm(profile.standingReach),
    maxTouchCm: parseMeasurementToCm(profile.maxTouch),
    mainGoal: profile.mainGoal || null,
    playStyleTags: normalizePlayStyleTags(profile.playStyle),
  };
}

function scoreHeight(userHeight: number | null, playerHeight: number | null) {
  if (!userHeight || !playerHeight) return { score: 0, missing: true };
  const difference = Math.abs(userHeight - playerHeight);
  return {
    score: Math.max(0, 1 - difference / 30) * heightWeight,
    missing: false,
  };
}

function scoreReach(userReach: number | null, player: ProPlayer) {
  const referenceReach = player.spikeReachCm ?? player.blockReachCm;
  if (!userReach || !referenceReach) return { score: 0, missing: true };
  const difference = Math.abs(userReach - referenceReach);
  return {
    score: Math.max(0, 1 - difference / 45) * reachWeight,
    missing: false,
  };
}

function scoreStyle(user: MatchUserProfile, player: ProPlayer) {
  const goalTags = user.mainGoal ? goalTagMap[user.mainGoal] ?? [] : [];
  const desiredTags = [...new Set([...user.playStyleTags, ...goalTags])];
  if (!desiredTags.length) return { score: styleWeight * 0.35, matchedTags: [] };

  const matchedTags = player.playStyleTags.filter((tag) =>
    desiredTags.includes(tag),
  );
  return {
    score: (matchedTags.length / desiredTags.length) * styleWeight,
    matchedTags,
  };
}

function buildReasons(
  user: MatchUserProfile,
  player: ProPlayer,
  matchedTags: PlayStyleTag[],
) {
  const reasons: string[] = [];
  if (user.position && user.position === player.position) {
    reasons.push(`Similar ${player.position.toLowerCase()} role`);
  }
  if (user.gender && user.gender === player.gender) {
    reasons.push(`Same ${player.gender.toLowerCase()} professional reference group`);
  }
  if (
    user.heightCm &&
    player.heightCm &&
    Math.abs(user.heightCm - player.heightCm) <= 8
  ) {
    reasons.push(`Similar listed height range (${player.heightCm} cm)`);
  }
  if (
    user.dominantHand !== "Unknown" &&
    player.dominantHand === user.dominantHand
  ) {
    reasons.push(`${player.dominantHand}-handed attacker profile`);
  }
  matchedTags.forEach((tag) => {
    reasons.push(`Shared study trait: ${tag}`);
  });
  if (!reasons.length) {
    reasons.push("Closest available profile in the current starter database");
  }
  return reasons;
}

function buildWarnings(user: MatchUserProfile, player: ProPlayer) {
  const warnings = [
    "This is a profile-based match, not a real movement-analysis match yet.",
  ];
  if (!user.heightCm) warnings.push("User height was unavailable or unreadable.");
  if (!user.position) warnings.push("User position was unavailable.");
  if (user.dominantHand === "Unknown") {
    warnings.push("User dominant hand was unavailable.");
  }
  if (player.dominantHand === "Unknown") {
    warnings.push(`${player.fullName}'s dominant hand is not sourced in this seed profile.`);
  }
  if (!user.maxTouchCm) warnings.push("User max touch was unavailable.");
  if (!player.spikeReachCm) {
    warnings.push(`${player.fullName}'s spike reach is unavailable.`);
  }
  return warnings;
}

export function findSimilarProPlayers(
  userProfile: MatchUserProfile,
  players: ProPlayer[],
  limit = 6,
): PlayerMatchResult {
  const matches = players
    .map((player): ProPlayerMatch => {
      const positionScore =
        userProfile.position && userProfile.position === player.position
          ? positionWeight
          : 0;
      const handScore =
        userProfile.dominantHand !== "Unknown" &&
        player.dominantHand === userProfile.dominantHand
          ? handWeight
          : 0;
      const genderAdjustment =
        userProfile.gender && userProfile.gender !== player.gender ? -8 : 0;
      const height = scoreHeight(userProfile.heightCm, player.heightCm);
      const reach = scoreReach(userProfile.maxTouchCm, player);
      const style = scoreStyle(userProfile, player);
      const rawScore =
        positionScore +
        handScore +
        height.score +
        style.score +
        reach.score +
        genderAdjustment;
      const similarityScore = Math.max(0, Math.min(100, Math.round(rawScore)));
      const whatToStudy = [
        ...new Set(
          [...style.matchedTags, ...player.playStyleTags.slice(0, 2)].map(
            (tag) => studyByTag[tag],
          ),
        ),
      ].slice(0, 4);

      return {
        player,
        similarityScore,
        reasonsForMatch: buildReasons(userProfile, player, style.matchedTags),
        whatToStudy,
        missingDataWarnings: buildWarnings(userProfile, player),
      };
    })
    .sort((left, right) => right.similarityScore - left.similarityScore)
    .slice(0, limit);

  return {
    matchedPlayers: matches,
    warnings: [
      "These players may be useful study references because they share similar profile traits.",
      "This is a reference, not a prescription. Coach review recommended.",
      "Movement-based matching requires a validated database of professional player landmarks.",
    ],
  };
}

export function findMovementSimilarPlayers(
  userMovementProfile: MovementProfile,
  proMovementProfiles: MovementProfile[],
) {
  void userMovementProfile;
  void proMovementProfiles;

  return {
    matchedPlayers: [],
    message:
      "Movement-based matching is not available yet. This requires a validated database of professional player movement landmarks.",
  };
}
