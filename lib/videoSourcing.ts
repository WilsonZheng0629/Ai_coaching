export type VideoSourceType = "public-link" | "first-party";
export type UnknownText = string | "unknown";
export type CameraAngle = "side" | "front" | "back" | "diagonal" | "unknown";
export type QualityLevel = "high" | "medium" | "low" | "unknown";
export type YesNoUnknown = "yes" | "no" | "unknown";
export type PermissionStatus =
  | "public-link-only"
  | "permission-granted"
  | "unknown";
export type VideoUseCase =
  | "smoke-test"
  | "validation"
  | "training-data"
  | "do-not-use";
export type ManualLabelStatus = "unlabeled" | "labeled" | "needs-review";
export type ApproachQuality = "good" | "average" | "poor" | "unknown";
export type MainApproachIssue =
  | "approach rhythm"
  | "penultimate step"
  | "arm swing timing"
  | "takeoff mechanics"
  | "landing control"
  | "unknown";
export type LabelConfidence = "high" | "medium" | "low";

export type VideoManualLabel = {
  overallApproachQuality: ApproachQuality;
  mainIssue: MainApproachIssue;
  recommendedCue: string;
  recommendedDrill: string;
  labelConfidence: LabelConfidence;
};

export type VideoSourcingRecord = {
  id: string;
  sourceType: VideoSourceType;
  videoUrl: string;
  athleteName: UnknownText;
  position: UnknownText;
  gender: UnknownText;
  handedness: UnknownText;
  cameraAngle: CameraAngle;
  videoQuality: QualityLevel;
  fullBodyVisible: YesNoUnknown;
  feetVisible: YesNoUnknown;
  cameraStable: YesNoUnknown;
  takeoffVisible: YesNoUnknown;
  landingVisible: YesNoUnknown;
  lightingQuality: QualityLevel;
  permissionStatus: PermissionStatus;
  useCase: VideoUseCase;
  manualLabelStatus: ManualLabelStatus;
  notes: string;
  sourceUrl: string;
  createdAt: string;
  manualLabel: VideoManualLabel;
  isSampleData: true;
};

export function generateSearchQueries() {
  return [
    "volleyball hitting approach side view",
    "volleyball spike approach slow motion side view",
    "outside hitter approach mechanics side view",
    "volleyball penultimate step approach",
    "volleyball approach jump technique side view",
    "volleyball hitting approach breakdown",
    "volleyball spike approach footwork side view",
    "volleyball arm swing timing approach",
    "volleyball approach jump slow motion",
    "volleyball hitting approach coaching breakdown",
    "opposite hitter approach side view volleyball",
    "volleyball spike takeoff landing side view",
  ];
}

const defaultLabel: VideoManualLabel = {
  overallApproachQuality: "unknown",
  mainIssue: "unknown",
  recommendedCue: "",
  recommendedDrill: "",
  labelConfidence: "low",
};

export const sampleVideoSourcingRecords: VideoSourcingRecord[] = [
  {
    id: "sample-001",
    sourceType: "public-link",
    videoUrl: "https://example.com/public-candidate-001",
    athleteName: "unknown",
    position: "unknown",
    gender: "unknown",
    handedness: "unknown",
    cameraAngle: "side",
    videoQuality: "medium",
    fullBodyVisible: "yes",
    feetVisible: "yes",
    cameraStable: "unknown",
    takeoffVisible: "yes",
    landingVisible: "unknown",
    lightingQuality: "medium",
    permissionStatus: "public-link-only",
    useCase: "smoke-test",
    manualLabelStatus: "needs-review",
    notes:
      "SAMPLE DATA. Public link candidate only; verify license before using.",
    sourceUrl: "https://example.com/source-001",
    createdAt: "2026-06-24",
    manualLabel: defaultLabel,
    isSampleData: true,
  },
  {
    id: "sample-002",
    sourceType: "first-party",
    videoUrl: "first-party-placeholder-002",
    athleteName: "unknown",
    position: "Outside Hitter",
    gender: "unknown",
    handedness: "Right",
    cameraAngle: "side",
    videoQuality: "high",
    fullBodyVisible: "yes",
    feetVisible: "yes",
    cameraStable: "yes",
    takeoffVisible: "yes",
    landingVisible: "yes",
    lightingQuality: "high",
    permissionStatus: "permission-granted",
    useCase: "validation",
    manualLabelStatus: "unlabeled",
    notes: "SAMPLE DATA. Represents ideal first-party validation candidate.",
    sourceUrl: "internal-consent-log-placeholder",
    createdAt: "2026-06-24",
    manualLabel: {
      ...defaultLabel,
      recommendedCue: "Long-short, load, then jump tall.",
      recommendedDrill: "Penultimate step rhythm drill",
      labelConfidence: "medium",
    },
    isSampleData: true,
  },
  {
    id: "sample-003",
    sourceType: "public-link",
    videoUrl: "https://example.com/public-candidate-003",
    athleteName: "unknown",
    position: "unknown",
    gender: "unknown",
    handedness: "unknown",
    cameraAngle: "diagonal",
    videoQuality: "medium",
    fullBodyVisible: "yes",
    feetVisible: "unknown",
    cameraStable: "unknown",
    takeoffVisible: "yes",
    landingVisible: "yes",
    lightingQuality: "medium",
    permissionStatus: "unknown",
    useCase: "do-not-use",
    manualLabelStatus: "needs-review",
    notes: "SAMPLE DATA. License unknown; keep out of validation/training.",
    sourceUrl: "https://example.com/source-003",
    createdAt: "2026-06-24",
    manualLabel: defaultLabel,
    isSampleData: true,
  },
  {
    id: "sample-004",
    sourceType: "first-party",
    videoUrl: "first-party-placeholder-004",
    athleteName: "unknown",
    position: "Opposite",
    gender: "unknown",
    handedness: "Left",
    cameraAngle: "side",
    videoQuality: "medium",
    fullBodyVisible: "yes",
    feetVisible: "yes",
    cameraStable: "yes",
    takeoffVisible: "yes",
    landingVisible: "no",
    lightingQuality: "medium",
    permissionStatus: "permission-granted",
    useCase: "smoke-test",
    manualLabelStatus: "needs-review",
    notes:
      "SAMPLE DATA. Landing cropped, so this should not be validation data.",
    sourceUrl: "internal-consent-log-placeholder",
    createdAt: "2026-06-24",
    manualLabel: {
      ...defaultLabel,
      overallApproachQuality: "average",
      mainIssue: "landing control",
      recommendedCue: "Re-film wider so landing is visible.",
      recommendedDrill: "Approach jump to stick landing",
      labelConfidence: "low",
    },
    isSampleData: true,
  },
  {
    id: "sample-005",
    sourceType: "public-link",
    videoUrl: "https://example.com/public-candidate-005",
    athleteName: "unknown",
    position: "Middle Blocker",
    gender: "unknown",
    handedness: "unknown",
    cameraAngle: "front",
    videoQuality: "low",
    fullBodyVisible: "no",
    feetVisible: "no",
    cameraStable: "no",
    takeoffVisible: "unknown",
    landingVisible: "unknown",
    lightingQuality: "low",
    permissionStatus: "public-link-only",
    useCase: "do-not-use",
    manualLabelStatus: "needs-review",
    notes: "SAMPLE DATA. Bad angle and missing feet.",
    sourceUrl: "https://example.com/source-005",
    createdAt: "2026-06-24",
    manualLabel: defaultLabel,
    isSampleData: true,
  },
  {
    id: "sample-006",
    sourceType: "first-party",
    videoUrl: "first-party-placeholder-006",
    athleteName: "unknown",
    position: "Setter",
    gender: "unknown",
    handedness: "Right",
    cameraAngle: "diagonal",
    videoQuality: "high",
    fullBodyVisible: "yes",
    feetVisible: "yes",
    cameraStable: "yes",
    takeoffVisible: "yes",
    landingVisible: "yes",
    lightingQuality: "high",
    permissionStatus: "permission-granted",
    useCase: "validation",
    manualLabelStatus: "labeled",
    notes: "SAMPLE DATA. Diagonal robustness candidate.",
    sourceUrl: "internal-consent-log-placeholder",
    createdAt: "2026-06-24",
    manualLabel: {
      overallApproachQuality: "good",
      mainIssue: "unknown",
      recommendedCue: "Keep the same rhythm and re-film side view.",
      recommendedDrill: "Controlled approach reps",
      labelConfidence: "medium",
    },
    isSampleData: true,
  },
  {
    id: "sample-007",
    sourceType: "public-link",
    videoUrl: "https://example.com/public-candidate-007",
    athleteName: "unknown",
    position: "Outside Hitter",
    gender: "unknown",
    handedness: "unknown",
    cameraAngle: "side",
    videoQuality: "high",
    fullBodyVisible: "yes",
    feetVisible: "yes",
    cameraStable: "unknown",
    takeoffVisible: "yes",
    landingVisible: "yes",
    lightingQuality: "high",
    permissionStatus: "unknown",
    useCase: "smoke-test",
    manualLabelStatus: "needs-review",
    notes:
      "SAMPLE DATA. Looks promising for smoke test only until license is verified.",
    sourceUrl: "https://example.com/source-007",
    createdAt: "2026-06-24",
    manualLabel: defaultLabel,
    isSampleData: true,
  },
  {
    id: "sample-008",
    sourceType: "first-party",
    videoUrl: "first-party-placeholder-008",
    athleteName: "unknown",
    position: "Libero",
    gender: "unknown",
    handedness: "Right",
    cameraAngle: "side",
    videoQuality: "medium",
    fullBodyVisible: "yes",
    feetVisible: "yes",
    cameraStable: "yes",
    takeoffVisible: "no",
    landingVisible: "no",
    lightingQuality: "medium",
    permissionStatus: "permission-granted",
    useCase: "do-not-use",
    manualLabelStatus: "needs-review",
    notes: "SAMPLE DATA. Not a hitting approach clip.",
    sourceUrl: "internal-consent-log-placeholder",
    createdAt: "2026-06-24",
    manualLabel: defaultLabel,
    isSampleData: true,
  },
  {
    id: "sample-009",
    sourceType: "public-link",
    videoUrl: "https://example.com/public-candidate-009",
    athleteName: "unknown",
    position: "unknown",
    gender: "unknown",
    handedness: "unknown",
    cameraAngle: "back",
    videoQuality: "medium",
    fullBodyVisible: "yes",
    feetVisible: "unknown",
    cameraStable: "unknown",
    takeoffVisible: "yes",
    landingVisible: "yes",
    lightingQuality: "medium",
    permissionStatus: "public-link-only",
    useCase: "smoke-test",
    manualLabelStatus: "unlabeled",
    notes: "SAMPLE DATA. Useful only for pipeline stress testing.",
    sourceUrl: "https://example.com/source-009",
    createdAt: "2026-06-24",
    manualLabel: defaultLabel,
    isSampleData: true,
  },
  {
    id: "sample-010",
    sourceType: "first-party",
    videoUrl: "first-party-placeholder-010",
    athleteName: "unknown",
    position: "Outside Hitter",
    gender: "unknown",
    handedness: "Right",
    cameraAngle: "side",
    videoQuality: "high",
    fullBodyVisible: "yes",
    feetVisible: "yes",
    cameraStable: "yes",
    takeoffVisible: "yes",
    landingVisible: "yes",
    lightingQuality: "high",
    permissionStatus: "permission-granted",
    useCase: "validation",
    manualLabelStatus: "needs-review",
    notes: "SAMPLE DATA. Strong candidate shape for first-party validation.",
    sourceUrl: "internal-consent-log-placeholder",
    createdAt: "2026-06-24",
    manualLabel: {
      ...defaultLabel,
      overallApproachQuality: "average",
      mainIssue: "arm swing timing",
      recommendedCue: "Arms back with the load, then swing through takeoff.",
      recommendedDrill: "Slow-motion approach plus arm timing",
      labelConfidence: "medium",
    },
    isSampleData: true,
  },
];
