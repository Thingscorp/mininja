/**
 * Presentational mark. Presence levels 1–3.
 * Pass `lines` from adapters/mark/from-kit (or Node lockup.mjs).
 * Face / stage / action ids are kit SoT (recipe-compatible seams) — no parallel tables.
 * Mascot has no name — aria-label stays "Mininja mark".
 */
import { forwardRef, type CSSProperties } from "react";

/** Three mark rows; each row is five cells after render. */
export type MarkLines = readonly [string, string, string];

/**
 * Kit facing hint (`data-facing`).
 * Does not transform `lines` — pass already-mirrored rows from from-kit / lockup.
 */
export type Facing = "left" | "right";

export type MininjaProps = {
  /**
   * Kit face id (`kit/mark.json` faces.*). Host hint / recipe seam only —
   * does not load kit. Render from `lines`.
   * @default "idle"
   */
  face?: string;
  /**
   * Optional kit stage id (`kit/scene.json` stages.*.id).
   * Host / recipe seam only. Omitted from the DOM when unset.
   */
  stage?: string;
  /**
   * Optional kit action id (`kit/scene.json` actions.*.id).
   * Host / recipe seam only. Omitted from the DOM when unset.
   */
  action?: string;
  /**
   * Facing hint for host motion / CSS. Does not mirror glyphs —
   * mirror with `linesFor(kit, face, "left")` then pass those lines.
   * @default "right"
   */
  facing?: Facing;
  /** Required: three mark lines from from-kit / lockup (or a pasted idle). */
  lines: MarkLines;
  className?: string;
  style?: CSSProperties;
  /**
   * Host must disable walk / patrol when true.
   * Surfaces as `data-reduced-motion="true"|"false"` for CSS hooks.
   * @default false
   */
  reducedMotion?: boolean;
};

const markStyle: CSSProperties = {
  margin: 0,
  lineHeight: 1,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontWeight: 500,
  color: "currentColor",
  whiteSpace: "pre",
};

function facingOf(facing: Facing | undefined): Facing {
  return facing === "left" ? "left" : "right";
}

/**
 * Renders mark lines into a monospace `<pre>`.
 * No data loading. No motion. No `console/` imports.
 */
export const Mininja = forwardRef<HTMLPreElement, MininjaProps>(
  function Mininja(
    {
      face = "idle",
      stage,
      action,
      facing = "right",
      lines,
      className,
      style,
      reducedMotion = false,
    },
    ref,
  ) {
    return (
      <pre
        ref={ref}
        className={className}
        role="img"
        aria-label="Mininja mark"
        data-face={face}
        data-facing={facingOf(facing)}
        data-reduced-motion={reducedMotion ? "true" : "false"}
        {...(stage != null && stage !== "" ? { "data-stage": stage } : null)}
        {...(action != null && action !== "" ? { "data-action": action } : null)}
        style={{ ...markStyle, ...style }}
      >
        {lines.join("\n")}
      </pre>
    );
  },
);

Mininja.displayName = "Mininja";
