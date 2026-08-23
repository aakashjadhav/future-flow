import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { MoneyFlow } from "@/components/finance/MoneyFlow";
import { StatCard } from "@/components/finance/StatCard";
import { useHydrated } from "@/hooks/useHydrated";
import { usePlan } from "@/hooks/usePlan";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Your financial analysis — Alloq" },
      {
        name: "description",
        content:
          "Your income, commitments, surplus, emergency-fund gap and total goal funding requirement in one view.",
      },
      { property: "og:title", content: "Your financial analysis — Alloq" },
      { property: "og:description", content: "Cash flow, surplus and goal funding requirement." },
    ],
  }),
  component: AnalysisPage,
});

const PHASES = [
  "Analyzing your cash flow",
  "Calculating goal requirements",
  "Comparing timelines",
  "Building your monthly allocation",
  "Preparing your plan",
];

function AnalysisPage() {
  const hydrated = useHydrated();
  const { summary, plan } = usePlan();
  const [phase, setPhase] = useState(0);
  const done = phase >= PHASES.length;

  useEffect(() => {
    if (!hydrated || done) return;
    const t = setTimeout(() => setPhase((p) => p + 1), 620);
    return () => clearTimeout(t);
  }, [hydrated, phase, done]);

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
        <Logo to="/dashboard" />
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex min-h-[60vh] flex-col justify-center"
            >
              <h1 className="text-3xl font-bold sm:text-4xl">Let's build your plan.</h1>
              <ul className="mt-8 space-y-3">
                {PHASES.map((p, i) => (
                  <motion.li
                    key={p}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: i <= phase ? 1 : 0.35, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    {i < phase ? (
                      <Check className="size-4 text-positive" aria-hidden />
                    ) : i === phase ? (
                      <Loader2 className="size-4 animate-spin text-accent" aria-hidden />
                    ) : (
                      <span className="size-4 rounded-full border border-border" aria-hidden />
                    )}
                    <span className={i <= phase ? "text-foreground" : "text-muted-foreground"}>{p}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="pt-6"
            >
              <p className="label-caps">Financial analysis</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                You have{" "}
                <span className="text-accent">{formatINR(summary.surplus)}</span> to work with each
                month.
              </h1>
              <p className="mt-3 max-w-xl text-ink-soft">
                Here's how that number is arrived at, and what your goals currently ask for.
              </p>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="panel p-5 sm:p-6">
                  <p className="label-caps">Monthly surplus</p>
                  <MoneyFlow
                    className="mt-3"
                    steps={[
                      { label: "Income", amount: summary.monthlyIncome },
                      { label: "Essentials", amount: summary.essentialExpenses, tone: "out" },
                      { label: "EMIs", amount: summary.emiTotal, tone: "out" },
                      { label: "Other spending", amount: summary.discretionaryExpenses, tone: "out" },
                      { label: "Available", amount: summary.surplus, tone: "available" },
                    ]}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <StatCard label="Existing assets" value={summary.assetsTotal} format="compact" index={0} />
                  <StatCard
                    label="Emergency-fund gap"
                    value={summary.emergencyGap}
                    format="compact"
                    tone={summary.emergencyGap > 0 ? "warning" : "positive"}
                    index={1}
                  />
                  <StatCard
                    label="Goals ask for"
                    value={plan.totalRequired}
                    note="per month, across all goals"
                    index={2}
                  />
                  <StatCard
                    label="Funding gap"
                    value={plan.fundingGap}
                    tone={plan.fundingGap > 0 ? "critical" : "positive"}
                    note={plan.fundingGap > 0 ? "Some goals need a longer horizon" : "Everything is fundable"}
                    index={3}
                  />
                  <div className="panel p-5 sm:col-span-2">
                    <p className="text-sm text-ink-soft">
                      Next we turn this surplus into a specific monthly allocation across your
                      goals, with an honest status for each one.
                    </p>
                    <Link
                      to="/plan"
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px"
                    >
                      See my monthly plan <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
