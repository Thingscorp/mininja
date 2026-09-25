/** Side-view pigeon. Tail tucked under the breast. */

export type PigeonPose = "perch" | "flap" | "best" | "sulk" | "peck" | "startle";

export const PIGEON: Record<PigeonPose, string[][]> = {
  perch: [
    ["(•)>", "/)"],
    ["(-)>", "/)"],
  ],
  flap: [
    ["<(•)>", " /)"],
    ["(•)>", "/)"],
    ["/(•)>", " /)"],
    ["(•)>", "/)"],
  ],
  best: [["<(•)>", " /)"]],
  sulk: [["(-).", "/)"]],
  peck: [
    ["(•)>", "/)"],
    ["(•)v", "/)"],
  ],
  startle: [["(o)>", "/)"]],
};

const FROM_FACE: Record<string, PigeonPose> = {
  allowed: "best",
  sandboxing: "flap",
  denied: "sulk",
  error: "startle",
  cancelled: "sulk",
  warning: "peck",
  completed: "perch",
};

export function poseFromFace(face?: string): PigeonPose {
  return FROM_FACE[face ?? ""] ?? "perch";
}
