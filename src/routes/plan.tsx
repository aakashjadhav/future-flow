import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AllocationBar } from "@/components/finance/AllocationBar";
import { MoneyFlow } from "@/components/finance/MoneyFlow";
import { StatusPill } from "@/components/finance/StatusPill";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/useHydrated";
import { usePlan } from "@/hooks/usePlan";
import { formatINR, formatMonthYear } from "@/lib/format";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Your monthly plan — Alloq" },
      {
        name: "description",
        content:
          "Your available monthly money allocated across your emergency fund, each goal and a buffer.",
      },
      { property: "og:title", content: "Your monthly plan — Alloq" },
      { property: "og:description", content: "A goal-by-goal monthly allocation of your surplus." },
    ],
  }),
  component: PlanPage,
});

function PlanPage() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const { profile, summary, plan } = usePlan();

  return (
    <AppShell
      title="Here's your monthly plan."
      subtitle="Every rupee of your available money has a destination. Select any line to see the detail behind it."
    >
      {!hydrated ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="panel p-5 sm:p-7">
            <AllocationBar
              allocations={plan.allocations}
              available={plan.available}
              onOpenGoal={(goalId) => navigate({ to: "/goal/$goalId", params: { goalId } })}
            />
            <p className="mt-6 text-xs text-muted-foreground">
              Projected values are estimates based on the assumptions shown and are not guaranteed
              returns.
            </p>
          </section>

          <div className="space-y-6">
            <section className="panel p-5">
              <p className="label-caps">Your money flow</p>
              <MoneyFlow
                className="mt-3"
                steps={[
                  { label: "Income", amount: summary.monthlyIncome },
                  { label: "Committed", amount: summary.committed, tone: "out" },
                  { label: "Available", amount: summary.surplus, tone: "available" },
                ]}
                branches={plan.allocations
                  .filter((a) => a.kind === "goal")
                  .map((a) => ({ label: a.label, amount: a.amount, color: a.colorToken }))}
                compactBranches
              />
            </section>

            <section className="panel p-5">
              <p className="label-caps">Goal status</p>
              <ul className="mt-3 space-y-3">
                {profile.goals.map((g) => {
                  const alloc = plan.allocations.find((a) => a.goalId === g.id);
                  return (
                    <li key={g.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to="/goal/$goalId"
                          params={{ goalId: g.id }}
                          className="truncate text-sm font-medium hover:text-accent"
                        >
                          {g.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {formatMonthYear(g.targetDate)} · needs{" "}
                          {formatINR(alloc?.requiredMonthly ?? 0)}/mo
                        </p>
                      </div>
                      <StatusPill status={alloc?.status ?? "on-track"} />
                    </li>
                  );
                })}
              </ul>
            </section>

            {!profile.premium ? (
              <section className="panel p-5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
                  <Sparkles className="size-3" aria-hidden /> Premium
                </span>
                <p className="mt-3 text-sm text-ink-soft">
                  Your goals ask for {formatINR(plan.totalRequired)} a month and you have{" "}
                  {formatINR(plan.available)}. Want to optimise this across all your goals?
                </p>
                <Link
                  to="/premium"
                  className="mt-4 inline-block rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary"
                >
                  Unlock Smart Allocation
                </Link>
              </section>
            ) : null}
          </div>
        </div>
      )}
    </AppShell>
  );
}
