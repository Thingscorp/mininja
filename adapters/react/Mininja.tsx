/**
 * Presentational mark. Levels 1–3.
 * Pass `lines` from adapters/mark/from-kit (or Node lockup.mjs) or kit/mark.json.
 * Face / stage / action ids are kit SoT (recipe-compatible seams) — no parallel tables.
 * Mascot has no name — aria-label stays "Mininja mark".
 */
import type { CSSProperties } from "react";

export type MininjaProps = {
  /**
   * Kit face id (`kit/mark.json` faces.*). Host hint only — does not load kit.
   * Later RECIPES plate targets these same ids.
   */
  face?: string;
  /**
   * Optional kit stage id (`kit/scene.json` stages.*.id). Host / recipe seam only.
   */
  stage?: string;
  /**
   * Optional kit action id (`kit/scene.json` actions.*.id). Host / recipe seam only.
   */
  action?: string;
  facing?: "left" | "right";
  /** Required: three mark lines from from-kit / lockup or kit/mark.json. */
  lines: [string, string, string];
  className?: string;
  style?: CSSProperties;
  /** Host must disable walk/patrol when true. */
  reducedMotion?: boolean;
};

/** Renders mark lines. No data loading. No motion. No console/ imports. */
export function Mininja({
  face = "idle",
  stage,
  action,
  facing = "right",
  lines,
  className,
  style,
  reducedMotion = false,
}: MininjaProps) {
  return (
    <pre
      className={className}
      data-face={face}
      data-stage={stage}
      data-action={action}
      data-facing={facing}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      aria-label="Mininja mark"
      style={{
        margin: 0,
        lineHeight: 1,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontWeight: 500,
        color: "currentColor",
        ...style,
      }}
    >
      {lines.join("\n")}
    </pre>
  );
}
