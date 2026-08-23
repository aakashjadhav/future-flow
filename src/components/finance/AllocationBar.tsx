import { useState } from "react";
import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { StatusPill } from "@/components/finance/StatusPill";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import type { Allocation } from "@/types/finance";

/**
 * Proprietary allocation strip: one continuous bar of monthly money, segments
 * animate their share, and selecting a segment expands its detail row.
 */
export function AllocationBar({
  allocations,
  available,
  onOpenGoal,
}: {
  allocations: Allocation[];
  available: number;
  onOpenGoal?: (goalId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const total = Math.max(
    1,
    allocations.reduce((a, b) => a + b.amount, 0),
  );

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="label-caps">Available every month</p>
          <AnimatedNumber value={available} className="figure-xl mt-1 block text-4xl sm:text-5xl" />
        </div>
        <p className="max-w-[16rem] text-right text-xs text-muted-foreground">
          Every rupee is assigned. Select a segment to see its detail.
        </p>
      </div>

      <div
        className="mt-5 flex h-14 w-full gap-1 overflow-hidden rounded-xl bg-secondary p-1"
        role="list"
        aria-label="Monthly allocation"
      >
        {allocations.map((a) => {
          const isSelected = selected === a.id;
          return (
            <motion.button
              key={a.id}
              role="listitem"
              type="button"
              layout
              onClick={() => setSelected(isSelected ? null : a.id)}
              aria-pressed={isSelected}
              aria-label={`${a.label}: ${formatINR(a.amount)} per month`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                flexGrow: (a.amount / total) * 100 * (isSelected ? 1.25 : 1),
              }}
              transition={{ type: "spring", stiffness: 180, damping: 26 }}
              className={cn(
                "group relative min-w-[6px] rounded-lg transition-[box-shadow] outline-none",
                isSelected && "ring-2 ring-offset-2 ring-offset-card ring-foreground/30",
              )}
              style={{ background: a.colorToken, flexBasis: 0 }}
            >
              <span className="sr-only">{a.label}</span>
            </motion.button>
          );
        })}
      </div>

      <ul className="mt-5 divide-y divide-border">
        {allocations.map((a) => {
          const isSelected = selected === a.id;
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setSelected(isSelected ? null : a.id)}
                className="flex w-full items-center justify-between gap-4 py-3 text-left transition-colors hover:bg-secondary/60"
                aria-expanded={isSelected}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: a.colorToken }}
                    aria-hidden
                  />
                  <span className="truncate text-sm font-medium">{a.label}</span>
                  {a.status ? <StatusPill status={a.status} className="hidden sm:inline-flex" /> : null}
                </span>
                <span className="figure-md shrink-0 text-base">
                  <AnimatedNumber value={a.amount} />
                  <span className="ml-0.5 text-xs font-normal text-muted-foreground">/mo</span>
                </span>
              </button>

              <motion.div
                initial={false}
                animate={{ height: isSelected ? "auto" : 0, opacity: isSelected ? 1 : 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="grid gap-3 pb-4 sm:grid-cols-3">
                  <Detail label="Share of available" value={`${Math.round((a.amount / total) * 100)}%`} />
                  <Detail
                    label="Required each month"
                    value={a.requiredMonthly ? formatINR(a.requiredMonthly) : "—"}
                  />
                  <Detail
                    label="Shortfall"
                    value={
                      a.requiredMonthly
                        ? formatINR(Math.max(0, a.requiredMonthly - a.amount))
                        : "—"
                    }
                  />
                  {a.goalId && onOpenGoal ? (
                    <button
                      type="button"
                      onClick={() => onOpenGoal(a.goalId!)}
                      className="justify-self-start text-sm font-medium text-accent underline-offset-4 hover:underline sm:col-span-3"
                    >
                      Open goal detail →
                    </button>
                  ) : null}
                </div>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary px-3 py-2">
      <p className="label-caps">{label}</p>
      <p className="figure-md mt-0.5 text-sm">{value}</p>
    </div>
  );
}
