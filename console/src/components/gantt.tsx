import { type Scheduled } from "@/lib/blockers";

export function Gantt({
  rows,
  onPick,
}: {
  rows: Scheduled[];
  onPick?: (id: string) => void;
}) {
  return (
    <ul className="space-y-1">
      {rows.map((r) => (
        <li key={r.id}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPick?.(r.id);
            }}
            className="grid w-full grid-cols-[3.5rem_2rem_1fr] items-baseline gap-3 text-left"
          >
            <span className={r.ready ? "text-ok" : "text-muted"}>{r.ready ? "ready" : "wait"}</span>
            <span className="text-muted">{r.days}d</span>
            <span className="min-w-0 truncate text-hi">
              {r.title}
              {!r.ready ? <span className="ml-2 font-normal text-muted">← {r.waitingOn[0]}</span> : null}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
