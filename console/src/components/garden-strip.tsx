import type { CSSProperties } from "react";
import {
  clampGrowth,
  hostGardenOverlay,
  plantDrawHeight,
  LEAF_WIDTH_PX,
  type GardenProp,
} from "@/lib/scene";

/** Host pal chrome for plant tint — never from kit. */
export type GardenPal = {
  id: string;
  name: string;
  tint: string;
};

type GardenStripProps = {
  /** Habitat showPlants from host-config; default true. */
  showPlants?: boolean;
  /** Roster pals — tint chrome for roots. Empty → ambient example root+leaves. */
  pals?: GardenPal[];
  /** Optional authored overlay; when omitted, hostGardenOverlay(pals). */
  garden?: GardenProp[];
};

/**
 * Quiet early garden stalks under the scoot-track face.
 * Root + leaf silhouettes only — no banner diorama / stages / moon / crates.
 */
export function GardenStrip({ showPlants = true, pals = [], garden }: GardenStripProps) {
  if (!showPlants) return null;
  const plants = garden ?? hostGardenOverlay(pals);
  if (plants.length === 0) return null;

  // Preserve authored x order; strip layout is bottom-aligned flex (not stage world).
  const ordered = [...plants].sort((a, b) => a.x - b.x);

  return (
    <div className="garden-strip" aria-hidden="true">
      {ordered.map((p, i) => (
        <GardenStalk key={`garden-${p.stageId}-${p.palId ?? p.label ?? i}`} prop={p} />
      ))}
    </div>
  );
}

/** repoBranch plant — root uses kit growth height; leaf = fixed small (Occam). */
function GardenStalk({ prop }: { prop: GardenProp }) {
  const role = prop.role ?? "root";
  const growth = role === "leaf" ? undefined : clampGrowth(prop.growth);
  const h = plantDrawHeight(prop);
  const w = prop.w ?? (role === "leaf" ? LEAF_WIDTH_PX : undefined);
  const style: CSSProperties = {
    height: h,
    ...(w != null ? { width: w } : {}),
    ...(prop.tint ? ({ ["--pal-tint"]: prop.tint } as CSSProperties) : {}),
  };
  const roleClass = role !== "root" ? ` is-${role}` : "";
  return (
    <span
      className={`prop prop-repoBranch${prop.tint ? " has-pal" : ""}${roleClass}`}
      data-growth={growth}
      data-role={role}
      data-label={prop.label || undefined}
      title={prop.label || undefined}
      style={style}
    />
  );
}
