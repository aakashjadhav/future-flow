import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ScenarioSimulator } from "@/features/scenarios/ScenarioSimulator";
import { StatusPill } from "@/components/finance/StatusPill";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/useHydrated";
import { usePlan } from "@/hooks/usePlan";
import { formatINR, formatMonthYear } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scenarios")({
  head: () => ({
    meta: [
      { title: "Scenarios — Alloq" },
      {
        name: "description",
        content:
          "Change the monthly amount, the date or the step-up and watch each goal move between on track and at risk.",
      },
      { property: "og:title", content: "Scenarios — Alloq" },
      {
        property: "og:description",
        content: "Simulate contributions, dates and annual step-ups across every goal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScenariosPage,
});

function ScenariosPage() {
  const hydrated = useHydrated();
  const { profile, plan } = usePlan();
  const [activeId, setActiveId] = useState<string | null>(null);

  const goals = profile.goals;
  const selectedId = activeId ?? goals[0]?.id ?? null;
  const goal = goals.find((g) => g.id === selectedId) ?? goals[0];
  const allocation = plan.allocations.find((a) => a.goalId === goal?.id);

  return (
    <AppShell
      title="What if you changed something?"
      subtitle="Pick a goal, then move one input at a time. Every number updates instantly — nothing here is saved until you decide to apply it."
    >
      {!hydrated ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      ) : !goal ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Add a goal first — scenarios need something to simulate.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Goals">
            {goals.map((g) => {
              const alloc = plan.allocations.find((a) => a.goalId === g.id);
              const active = g.id === goal.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveId(g.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-foreground bg-foreground text-primary-foreground"
                      : "border-border hover:bg-secondary",
                  )}
                >
                  {g.name}
                  {!active && alloc?.status ? (
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        alloc.status === "on-track"
                          ? "bg-positive"
                          : alloc.status === "at-risk"
                            ? "bg-warning"
                            : "bg-critical",
                      )}
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="panel flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="label-caps">Current plan for {goal.name}</p>
              <p className="figure-md mt-1.5 text-lg">
                {formatINR(allocation?.amount ?? 0)}/month
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  of {formatINR(allocation?.requiredMonthly ?? 0)} needed by{" "}
                  {formatMonthYear(goal.targetDate)}
                </span>
              </p>
            </div>
            <StatusPill status={allocation?.status ?? "on-track"} />
          </div>

          <ScenarioSimulator
            key={goal.id}
            goal={goal}
            risk={profile.risk}
            startingMonthly={Math.round(allocation?.amount ?? allocation?.requiredMonthly ?? 5000)}
          />

          <p className="text-xs text-muted-foreground">
            Projections use the expected annual return you select and assume contributions continue
            uninterrupted. They are estimates, not guaranteed returns.
          </p>
        </div>
      )}
    </AppShell>
  );
}
