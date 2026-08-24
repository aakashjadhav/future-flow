import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useHydrated } from "@/hooks/useHydrated";
import { usePlanStore } from "@/store/planStore";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "Premium — Alloq" },
      {
        name: "description",
        content:
          "Unlimited goals, deeper instrument research, multi-goal scenarios and tax-aware allocation guidance.",
      },
      { property: "og:title", content: "Premium — Alloq" },
      {
        property: "og:description",
        content: "Everything in the free plan, plus unlimited goals and deep research.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PremiumPage,
});

const FREE = [
  "Up to 4 goals",
  "Monthly allocation plan",
  "Cashflow and health score",
  "Single-goal scenarios",
];

const PRO = [
  "Unlimited goals",
  "Deep research on any instrument",
  "Multi-goal scenario comparison",
  "Debt payoff vs invest analysis",
  "Tax-aware allocation guidance",
  "Plan exports and yearly reviews",
];

function PremiumPage() {
  const hydrated = useHydrated();
  const premium = usePlanStore((s) => s.profile.premium);
  const setPremium = usePlanStore((s) => s.setPremium);
  const navigate = useNavigate();

  return (
    <AppShell
      title="Unlock deeper planning"
      subtitle="The free plan gives you an honest picture. Premium goes further when your plan has more moving parts."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel p-6">
          <p className="label-caps">Free</p>
          <p className="figure-xl mt-2 text-3xl">₹0</p>
          <p className="mt-1 text-sm text-muted-foreground">Everything you need to get started.</p>
          <ul className="mt-5 space-y-2.5">
            {FREE.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel border-accent/30 bg-accent-soft/30 p-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
            <Sparkles className="size-3" aria-hidden /> Premium
          </span>
          <p className="figure-xl mt-3 text-3xl">
            ₹499
            <span className="ml-1 text-sm font-normal text-muted-foreground">/month</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Cancel any time. No lock-in.</p>
          <ul className="mt-5 space-y-2.5">
            {PRO.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
          {hydrated && premium ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-accent">Premium is active on this profile.</p>
              <button
                type="button"
                onClick={() => setPremium(false)}
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
              >
                Turn off premium (demo)
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setPremium(true);
                void navigate({ to: "/dashboard" });
              }}
              className="mt-6 w-full rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              Unlock premium
            </button>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            This prototype activates premium instantly — no payment is taken.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
