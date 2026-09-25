/**
 * Sketch: React face component (levels 1–3).
 * Copy into an app and load lines from @thingscorp/mininja/mark or kit/mark.json.
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
  face?: MininjaFace;
  facing?: "left" | "right";
  lines: [string, string, string];
  className?: string;
  style?: CSSProperties;
  /** When true, host must disable walk/patrol animations. */
  reducedMotion?: boolean;
};

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
