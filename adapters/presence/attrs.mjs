/**
 * Pure presence attribute helper. No I/O.
 * Face / stage / action / motion stay kit id strings (recipe-compatible seams).
 *
 * @typedef {{
 *   face?: string,
 *   stage?: string,
 *   action?: string,
 *   motion?: string,
 *   facing?: "left"|"right",
 *   reducedMotion?: boolean,
 *   className?: string,
 * }} PresenceOpts
 */

/**
 * Build DOM attrs for a mark that hosts / CSS can key on.
 * `motion` prefers an explicit id; otherwise falls back to `action` (kit SoT).
 * Emits both `data-motion` and `data-state` so working-slot CSS can use either.
 *
 * @param {PresenceOpts} [opts]
 * @returns {Record<string, string>}
 */
export function presenceAttrs(opts = {}) {
  const face = opts.face && opts.face !== "" ? opts.face : "idle";
  const facing = opts.facing === "left" ? "left" : "right";
  const reduced = opts.reducedMotion === true;
  const action =
    opts.action != null && opts.action !== "" ? String(opts.action) : "";
  const motionExplicit =
    opts.motion != null && opts.motion !== "" ? String(opts.motion) : "";
  const motionId = motionExplicit || action || "";

  /** @type {Record<string, string>} */
  const attrs = {
    role: "img",
    "aria-label": "Mininja mark",
    "data-face": face,
    "data-facing": facing,
    "data-reduced-motion": reduced ? "true" : "false",
  };
  if (opts.className) attrs.class = String(opts.className);
  if (opts.stage != null && opts.stage !== "") attrs["data-stage"] = String(opts.stage);
  if (action) attrs["data-action"] = action;
  if (motionId) {
    attrs["data-motion"] = motionId;
    attrs["data-state"] = motionId;
  }
  return attrs;
}

/**
 * Serialize attrs to an HTML attribute string (values escaped).
 * @param {Record<string, string>} attrs
 * @returns {string}
 */
export function attrsToString(attrs) {
  return Object.entries(attrs)
    .map(([k, v]) => `${k}="${esc(v)}"`)
    .join(" ");
}

/**
 * @param {string} s
 * @returns {string}
 */
export function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Chip label bits — host copy only. Mark stays unnamed.
 * @param {{ label?: string, peer?: string, maxPeer?: number }} [opts]
 * @returns {{ label: string, peer: string }}
 */
export function chipCopy(opts = {}) {
  const label = opts.label != null && opts.label !== "" ? String(opts.label) : "Messaged";
  const max = Number.isFinite(opts.maxPeer) ? /** @type {number} */ (opts.maxPeer) : 18;
  let peer = opts.peer != null ? String(opts.peer) : "";
  if (peer.length > max) peer = peer.slice(0, Math.max(0, max - 1)) + "…";
  return { label, peer };
}

/**
 * Sidebar / roster row label — host copy. Mark stays unnamed.
 * @param {{ name?: string, maxName?: number }} [opts]
 * @returns {{ name: string }}
 */
export function rosterCopy(opts = {}) {
  const max = Number.isFinite(opts.maxName) ? /** @type {number} */ (opts.maxName) : 22;
  let name = opts.name != null && opts.name !== "" ? String(opts.name) : "agent";
  if (name.length > max) name = name.slice(0, Math.max(0, max - 1)) + "…";
  return { name };
}
