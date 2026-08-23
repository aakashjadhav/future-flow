import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/finance/StatCard";
import { MoneyFlow } from "@/components/finance/MoneyFlow";
import { StatusPill } from "@/components/finance/StatusPill";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/useHydrated";
import { usePlan } from "@/hooks/usePlan";
import { formatINR, formatMonthYear } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Overview — Alloq" },
      {
        name: "description",
        content:
          "Your financial health score, monthly cash flow, debt, emergency fund and recommended monthly allocation.",
      },
      { property: "og:title", content: "Overview — Alloq" },
      { property: "og:description", content: "Financial health, cash flow and goal allocation." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const hydrated = useHydrated();
  const { profile, summary, plan } = usePlan();

  if (!hydrated) {
    return (
      <AppShell title="Overview">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="mt-6 h-80 w-full" />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Overview"
      subtitle="Where your money stands this month, and what it's working toward."
      action={
        <Link
          to="/plan"
          className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Open my plan
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-5 sm:p-6">
          <p className="label-caps">Financial health score</p>
          <div className="mt-3 flex items-end gap-4">
            <AnimatedNumber value={summary.healthScore} format="plain" className="figure-xl text-5xl" />
            <span className="pb-1.5 text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${summary.healthScore}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <dl className="mt-5 space-y-2 text-sm">
            <Line label="Savings rate" value={`${summary.savingsRate.toFixed(0)}%`} />
            <Line label="Emergency fund" value={`${Math.round(summary.emergencyProgress)}% funded`} />
            <Line
              label="EMI load"
              value={`${((summary.emiTotal / Math.max(1, summary.monthlyIncome)) * 100).toFixed(0)}% of income`}
            />
            <Line label="Cards" value={profile.creditCard.revolves ? "Revolving balance" : "Paid in full"} />
          </dl>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Monthly income" value={summary.monthlyIncome} index={0} />
          <StatCard
            label="Monthly commitments"
            value={summary.committed}
            note="Essentials, spending, EMIs"
            index={1}
          />
          <StatCard label="Available" value={summary.surplus} tone="accent" index={2} />
          <StatCard label="Outstanding debt" value={summary.debtOutstanding} format="compact" index={3} />
          <StatCard label="Existing assets" value={summary.assetsTotal} format="compact" index={4} />
          <StatCard
            label="Emergency fund"
            value={summary.emergencyProgress}
            format="percent"
            tone={summary.emergencyProgress >= 100 ? "positive" : "warning"}
            note={`${formatINR(profile.emergencySavings)} of ${formatINR(summary.emergencyTarget)}`}
            index={5}
          />
        </div>
      </div>

      <section className="panel mt-6 p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label-caps">Signature view</p>
            <h2 className="mt-1 text-xl font-bold">Your Money Flow</h2>
          </div>
          <Link to="/plan" className="text-sm font-medium text-accent hover:underline">
            Full allocation detail →
          </Link>
        </div>
        <div className="mt-5">
          <MoneyFlow
            steps={[
              { label: "Income", amount: summary.monthlyIncome },
              { label: "Committed", amount: summary.committed, tone: "out", note: "Essentials, spending and EMIs" },
              { label: "Available", amount: summary.surplus, tone: "available" },
            ]}
            branches={plan.allocations.map((a) => ({
              label: a.label,
              amount: a.amount,
              color: a.colorToken,
            }))}
          />
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <p className="label-caps">Goals</p>
          <ul className="mt-3 divide-y divide-border">
            {profile.goals.length === 0 ? (
              <li className="py-6 text-center">
                <p className="text-sm font-medium">What are you planning for?</p>
                <Link to="/goals" className="mt-2 inline-block text-sm text-accent hover:underline">
                  Add a Goal
                </Link>
              </li>
            ) : (
              profile.goals.map((g) => {
                const alloc = plan.allocations.find((a) => a.goalId === g.id);
                return (
                  <li key={g.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        to="/goal/$goalId"
                        params={{ goalId: g.id }}
                        className="truncate text-sm font-medium hover:text-accent"
                      >
                        {g.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{formatMonthYear(g.targetDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="figure-md text-sm">{formatINR(alloc?.amount ?? 0)}</span>
                      <StatusPill status={alloc?.status ?? "on-track"} />
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <div className="panel p-5">
          <p className="label-caps">Recent changes</p>
          <ul className="mt-3 space-y-3 text-sm">
            {[
              ["Plan recalculated", `Available money is ${formatINR(summary.surplus)} this month`],
              ["Emergency fund", `${Math.round(summary.emergencyProgress)}% of the recommended range`],
              ["Risk profile", `${profile.risk} — used for return assumptions`],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                <span>
                  <span className="font-medium">{t}</span>
                  <span className="block text-xs text-muted-foreground capitalize">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
