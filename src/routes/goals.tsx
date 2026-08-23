import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GoalCard } from "@/components/finance/GoalCard";
import { GoalBuilder } from "@/features/goals/GoalBuilder";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/useHydrated";
import { usePlan } from "@/hooks/usePlan";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals — Alloq" },
      {
        name: "description",
        content:
          "Every goal with its target, date, required monthly contribution and honest funding status.",
      },
      { property: "og:title", content: "Goals — Alloq" },
      { property: "og:description", content: "Targets, dates and required monthly contributions." },
    ],
  }),
  component: GoalsPage,
});

const FREE_GOAL_LIMIT = 4;

function GoalsPage() {
  const hydrated = useHydrated();
  const { profile, plan } = usePlan();
  const [building, setBuilding] = useState(false);
  const limitReached = !profile.premium && profile.goals.length >= FREE_GOAL_LIMIT;

  return (
    <AppShell
      title="What are you planning for?"
      subtitle={`Your goals ask for ${hydrated ? formatINR(plan.totalRequired) : "—"} a month in total. The plan splits what you have across them by priority and horizon.`}
      action={
        <button
          type="button"
          onClick={() => setBuilding((b) => !b)}
          disabled={limitReached}
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden /> Add a goal
        </button>
      }
    >
      {!hydrated ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {building ? <GoalBuilder onDone={() => setBuilding(false)} onCancel={() => setBuilding(false)} /> : null}

          {limitReached ? (
            <p className="rounded-lg border border-border bg-accent-soft px-4 py-3 text-sm text-ink-soft">
              The free plan covers up to {FREE_GOAL_LIMIT} goals. Premium removes the limit and
              optimises funding across all of them.
            </p>
          ) : null}

          {profile.goals.length === 0 && !building ? (
            <div className="panel p-10 text-center">
              <h2 className="text-xl font-semibold">What are you planning for?</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Add your first goal and we'll help you understand what it may take to get there.
              </p>
              <button
                type="button"
                onClick={() => setBuilding(true)}
                className="mt-5 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Add a Goal
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.goals.map((g, i) => {
                const projection = plan.projections.find((p) => p.goalId === g.id)!;
                const alloc = plan.allocations.find((a) => a.goalId === g.id);
                return (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    projection={projection}
                    allocated={alloc?.amount ?? 0}
                    status={alloc?.status ?? "on-track"}
                    index={i}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
