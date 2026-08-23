import { cn } from "@/lib/utils";
import type { GoalStatus } from "@/types/finance";

const MAP: Record<GoalStatus, { label: string; className: string }> = {
  "on-track": {
    label: "On track",
    className: "bg-positive-soft text-positive border-positive/20",
  },
  "at-risk": {
    label: "At risk",
    className: "bg-warning-soft text-warning border-warning/25",
  },
  "not-feasible": {
    label: "Not feasible",
    className: "bg-critical-soft text-critical border-critical/20",
  },
};

export function StatusPill({ status, className }: { status: GoalStatus; className?: string }) {
  const s = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase",
        s.className,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {s.label}
    </span>
  );
}
