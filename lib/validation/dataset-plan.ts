export type DatasetSource = {
  name: string;
  url: string;
  contains: string;
  sideViewApproaches: string;
  annotations: string;
  usageStatus: "usable-if-verified" | "reference-only" | "not-enough";
  license: string;
  usefulness: string;
  risks: string;
};

export const datasetSources: DatasetSource[] = [
  {
    name: "Wikimedia Commons: Videos of volleyball",
    url: "https://commons.wikimedia.org/wiki/Category:Videos_of_volleyball",
    contains: "Public volleyball match and training video files.",
    sideViewApproaches:
      "Possible on a clip-by-clip basis, but not guaranteed.",
    annotations: "No pose labels or approach phase labels.",
    usageStatus: "usable-if-verified",
    license:
      "Per-file open license. Verify the specific file license before downloading.",
    usefulness:
      "Best public source for a tiny legal smoke test because license metadata is visible.",
    risks:
      "Small pool, inconsistent angles, and many clips will not show a full approach.",
  },
  {
    name: "Pexels volleyball videos",
    url: "https://www.pexels.com/search/videos/volleyball%20spike/",
    contains: "Stock volleyball videos that may include hitting or jumping.",
    sideViewApproaches:
      "Sometimes possible, but many clips are edited, cropped, or staged.",
    annotations: "No pose labels or approach phase labels.",
    usageStatus: "usable-if-verified",
    license:
      "Pexels license permits broad free use with restrictions. Verify each asset page.",
    usefulness:
      "Good for 1-3 visually clean pipeline smoke-test clips if the full body and feet are visible.",
    risks:
      "Stock footage may omit approach start, plant, takeoff, or landing.",
  },
  {
    name: "Pixabay volleyball videos",
    url: "https://pixabay.com/videos/search/volleyball/",
    contains: "Stock volleyball clips, mostly unlabeled.",
    sideViewApproaches: "Possible, but must be manually inspected.",
    annotations: "No pose labels or approach phase labels.",
    usageStatus: "usable-if-verified",
    license:
      "Pixabay content license allows many uses with restrictions. Verify each asset page.",
    usefulness:
      "Supplemental smoke-test material if clips show full-body movement clearly.",
    risks:
      "May be too short, cropped, slow-motion, or not a real hitting approach.",
  },
  {
    name: "Volleyball group activity recognition dataset",
    url: "https://github.com/mostafa-saad/deep-activity-rec",
    contains:
      "Research-format volleyball match frames/actions used for group activity recognition.",
    sideViewApproaches:
      "Mostly broadcast-style views; not controlled side-view approach footage.",
    annotations:
      "Action/group annotations exist in related research, not AthletIQ phase labels.",
    usageStatus: "reference-only",
    license:
      "Video rights are unclear from public mirrors. Do not use for product validation without rights review.",
    usefulness:
      "Useful for action taxonomy inspiration and understanding broadcast failure modes.",
    risks:
      "Likely not legally clean for commercial validation, and not side-view mechanics data.",
  },
  {
    name: "COCO WholeBody / COCO keypoints",
    url: "https://github.com/jin-s13/COCO-WholeBody",
    contains: "Large static-image human keypoint annotations.",
    sideViewApproaches: "No volleyball-specific approach videos.",
    annotations: "Body, hand, face, and foot keypoints depending on subset.",
    usageStatus: "reference-only",
    license:
      "Annotations are open; original image licenses vary and must be respected.",
    usefulness:
      "Useful for general foot-landmark expectations, not event timing validation.",
    risks: "Static images cannot validate takeoff, landing, or phase timing.",
  },
  {
    name: "PoseTrack",
    url: "https://posetrack.net/",
    contains: "Multi-person pose tracking benchmark videos.",
    sideViewApproaches: "No volleyball-specific guarantee.",
    annotations: "Pose tracking annotations, not volleyball approach events.",
    usageStatus: "reference-only",
    license:
      "Research benchmark terms must be checked before reuse in product validation.",
    usefulness:
      "Useful for general tracking stability ideas and metric design.",
    risks: "Not volleyball-specific and not a substitute for first-party clips.",
  },
];

export const firstPartyCollectionTargets = [
  "10 clean side-view clips as the first milestone",
  "6-8 side-view clips for the first formal validation set",
  "3-4 diagonal 45-degree clips for robustness checks",
  "2-3 clips with partial occlusion or cropped feet for failure testing",
  "Right- and left-handed hitters across varied approach speeds",
  "1080p minimum, 60 fps preferred, tripod, no zoom or panning",
  "Full body visible from approach start through landing",
  "Written athlete consent/release for every recorded athlete",
];

export const labelingColumns = [
  "clip_id",
  "source",
  "license_status",
  "athlete_id",
  "handedness",
  "camera_view",
  "fps",
  "resolution",
  "total_frames",
  "approach_start_frame",
  "penultimate_step_frame",
  "plant_step_frame",
  "takeoff_frame",
  "peak_jump_frame",
  "landing_frame",
  "foot_visibility_score",
  "offscreen_frames",
  "occlusion_notes",
  "reviewer",
  "review_status",
];

export const sourceLogColumns = [
  "clip_id",
  "source_url",
  "download_date",
  "license",
  "license_url",
  "allowed_use",
  "status",
  "notes",
];

export const validationMetrics = [
  "average landmark confidence",
  "missing frame percentage",
  "foot visibility percentage",
  "athlete off-screen percentage",
  "takeoff detection error after manual labels exist",
  "landing detection error after manual labels exist",
  "phase ordering validity",
];
