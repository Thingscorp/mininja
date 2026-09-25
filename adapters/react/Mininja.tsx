/**
 * Presentational mark. Levels 1–3.
 * Pass `lines` from adapters/mark/from-kit (or Node lockup.mjs) or kit/mark.json.
 * Mascot has no name — aria-label stays "Mininja mark".
 */
import type { CSSProperties } from "react";

export type MininjaFace =
  | "idle"
  | "blink"
  | "evaluating"
  | "allowed"
  | "asking"
  | "denied"
  | "sandboxing"
  | "executing"
  | "completed"
  | "warning"
  | "error"
  | "cancelled"
  | "offline"
  | "loadingRight"
  | "loadingLeft";

export type MininjaProps = {
  /** Host hint only — does not load kit data. */
  face?: MininjaFace;
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
