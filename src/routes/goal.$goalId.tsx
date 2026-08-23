import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusPill } from "@/components/finance/StatusPill";
import { GOAL_META } from "@/components/finance/goalMeta";
import { ScenarioSimulator } from "@/features/scenarios/ScenarioSimulator";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/useHydrated";
import { usePlan } from "@/hooks/usePlan";
import { formatCompactINR, formatINR, formatMonthYear } from "@/lib/format";

export const Route = createFileRoute("/goal/$goalId")({
  head: () => ({
    meta: [
      { title: "Goal detail — Alloq" },
      {
        name: "description",
        content:
          "Required monthly contribution, recommended allocation, projection and scenarios for a single goal.",
      },
      { property: "og:title", content: "Goal detail — Alloq" },
      { property: "og:description", content: "Projection, strategy and scenarios for your goal." },
    ],
  }),
  component: GoalDetail,
});

function GoalDetail() {
  const { goalId } = Route.useParams();
  const hydrated = useHydrated();
  const { profile, plan } = usePlan();

  if (!hydrated) {
    return (
      <AppShell>
        <Skeleton className="h-96 w-full" />
      </AppShell>
    );
  }

  const goal = profile.goals.find((g) => g.id === goalId);
  if (!goal) {
    return (
      <AppShell title="Goal not found">
        <p className="text-sm text-muted-foreground">
          This goal no longer exists. It may have been removed.
        </p>
        <Link to="/goals" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
          Back to goals
        </Link>
      </AppShell>
    );
  }

  const projection = plan.projections.find((p) => p.goalId === goal.id)!;
  const alloc = plan.allocations.find((a) => a.goalId === goal.id);
  const meta = GOAL_META[goal.category];
  const Icon = meta.icon;

  return (
    <AppShell>
      <Link
        to="/goals"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> All goals
      </Link>

      <header className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            className="grid size-12 place-items-center rounded-xl"
            style={{ background: `color-mix(in oklab, ${meta.accent} 12%, transparent)` }}
          >
            <Icon className="size-6" style={{ color: meta.accent }} aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{goal.name}</h1>
            <p className="text-sm text-muted-foreground">
              {formatCompactINR(goal.targetAmount)} by {formatMonthYear(goal.targetDate)} ·{" "}
              {goal.flexibility === "fixed" ? "fixed date" : "flexible date"}
            </p>
          </div>
        </div>
        <StatusPill status={alloc?.status ?? "on-track"} />
      </header>

      <dl className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="Current amount" value={formatINR(goal.savedAmount)} />
        <Fact label="Required future amount" value={formatCompactINR(goal.targetAmount)} />
        <Fact
          label="Required monthly"
          value={formatINR(projection.requiredMonthly)}
          tone="ink"
        />
        <Fact
          label="Recommended allocation"
          value={formatINR(alloc?.amount ?? 0)}
          tone="accent"
        />
      </dl>

      <section className="panel mt-6 p-5 sm:p-6">
        <p className="label-caps">Strategy</p>
        <p className="mt-2 max-w-3xl text-sm text-ink-soft">
          {projection.monthsRemaining} months remain. Your existing{" "}
          {formatINR(goal.savedAmount)} is projected to grow to{" "}
          {formatCompactINR(projection.futureValueOfSaved)} at {projection.assumedReturn}% assumed
          annual return, leaving {formatCompactINR(projection.amountStillNeeded)} to fund through
          monthly contributions.{" "}
          {goal.flexibility === "flexible"
            ? "Because this goal has a flexible date, shifting the target later is the cheapest lever."
            : "This goal has a fixed date, so the monthly amount is the main lever."}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Projected values are estimates based on the assumptions shown and are not guaranteed
          returns.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold">Scenario simulator</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Change any input to see how the projection responds.
        </p>
        <div className="mt-5">
          <ScenarioSimulator
            goal={goal}
            risk={profile.risk}
            startingMonthly={alloc?.amount ?? projection.requiredMonthly}
          />
        </div>
      </section>
    </AppShell>
  );
}

function Fact({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "ink" | "accent";
}) {
  return (
    <div className="panel p-4">
      <dt className="label-caps">{label}</dt>
      <dd
        className={`figure-md mt-1.5 text-xl ${
          tone === "accent" ? "text-accent" : tone === "ink" ? "text-ink-soft" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
