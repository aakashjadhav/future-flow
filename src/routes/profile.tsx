import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Download, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/useHydrated";
import { usePlan } from "@/hooks/usePlan";
import { usePlanStore } from "@/store/planStore";
import { RETURN_ASSUMPTIONS } from "@/services/planEngine";
import { formatINR, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RiskProfile } from "@/types/finance";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Alloq" },
      {
        name: "description",
        content:
          "Your risk profile, return assumptions and data controls. Everything stays on this device unless you say otherwise.",
      },
      { property: "og:title", content: "Profile — Alloq" },
      { property: "og:description", content: "Risk profile, assumptions and data controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const RISKS: { value: RiskProfile; label: string; blurb: string }[] = [
  { value: "conservative", label: "Conservative", blurb: "Protect capital, accept slower growth." },
  { value: "moderate", label: "Moderate", blurb: "Balanced mix of growth and stability." },
  { value: "growth", label: "Growth", blurb: "Mostly equity, comfortable with swings." },
  { value: "aggressive", label: "Aggressive", blurb: "Maximum growth, long horizon only." },
];

function ProfilePage() {
  const hydrated = useHydrated();
  const { profile, summary } = usePlan();
  const setRisk = usePlanStore((s) => s.setRisk);
  const reset = usePlanStore((s) => s.reset);
  const loadSample = usePlanStore((s) => s.loadSample);
  const navigate = useNavigate();

  function exportPlan() {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alloq-plan.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell
      title="Your profile"
      subtitle="Assumptions and data controls. Change the risk profile and every projection updates."
    >
      {!hydrated ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          <section className="panel flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="label-caps">Signed in as</p>
              <p className="mt-1 text-sm font-medium">{profile.email || "Not signed in"}</p>
              {profile.isSample ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  This is the sample profile.{" "}
                  <Link to="/auth" className="text-accent underline-offset-4 hover:underline">
                    Build your own plan
                  </Link>
                </p>
              ) : null}
            </div>
            <dl className="flex gap-6">
              <div>
                <dt className="label-caps">Net worth</dt>
                <dd className="figure-md mt-1 text-sm">
                  {formatINR(summary.assetsTotal - summary.debtOutstanding)}
                </dd>
              </div>
              <div>
                <dt className="label-caps">Savings rate</dt>
                <dd className="figure-md mt-1 text-sm">{formatPercent(summary.savingsRate)}</dd>
              </div>
            </dl>
          </section>

          <section className="panel p-5 sm:p-6">
            <p className="label-caps">Risk profile</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sets the expected annual return used in every projection.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {RISKS.map((r) => {
                const active = profile.risk === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRisk(r.value)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors",
                      active
                        ? "border-accent bg-accent-soft/50"
                        : "border-border hover:bg-secondary",
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold">{r.label}</span>
                      <span className="figure-md text-sm text-accent">
                        {formatPercent(RETURN_ASSUMPTIONS[r.value])}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{r.blurb}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="panel p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-positive" aria-hidden />
              <div>
                <h2 className="text-sm font-semibold">Your data stays with you</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your figures are stored on this device only. No bank connections, no account
                  scraping, nothing shared with third parties.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={exportPlan}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium hover:bg-secondary"
              >
                <Download className="size-4" aria-hidden /> Export my data
              </button>
              <button
                type="button"
                onClick={() => loadSample()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium hover:bg-secondary"
              >
                <RotateCcw className="size-4" aria-hidden /> Load sample profile
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  void navigate({ to: "/" });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-critical/30 px-3.5 py-2 text-sm font-medium text-critical hover:bg-critical-soft"
              >
                <Trash2 className="size-4" aria-hidden /> Delete everything
              </button>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
