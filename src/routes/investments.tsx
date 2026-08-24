import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Lock, Search, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { investmentApi } from "@/services/financialApi";
import type { InvestmentInstrument } from "@/services/mockData";
import { useHydrated } from "@/hooks/useHydrated";
import { usePlanStore } from "@/store/planStore";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/investments")({
  head: () => ({
    meta: [
      { title: "Investments — Alloq" },
      {
        name: "description",
        content:
          "Explore mutual funds, ETFs, equities and fixed income with historical returns, risk and costs side by side.",
      },
      { property: "og:title", content: "Investments — Alloq" },
      {
        property: "og:description",
        content: "Compare instruments on returns, risk and expense ratio before you commit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvestmentsPage,
});

const CATEGORIES = [
  "All",
  "Mutual Funds",
  "ETFs",
  "Equities",
  "Fixed Income",
  "Other Instruments",
] as const;

function InvestmentsPage() {
  const hydrated = useHydrated();
  const premium = usePlanStore((s) => s.profile.premium);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["investments"],
    queryFn: () => investmentApi.list(),
  });

  const rows = useMemo(() => {
    const list = data ?? [];
    return list.filter(
      (i) =>
        (category === "All" || i.category === category) &&
        (query.trim() === "" ||
          `${i.name} ${i.subCategory}`.toLowerCase().includes(query.trim().toLowerCase())),
    );
  }, [data, category, query]);

  return (
    <AppShell
      title="Where the money could go"
      subtitle="Educational information only. Returns shown are historical and do not predict future performance."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search instruments"
              aria-label="Search instruments"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  c === category
                    ? "border-foreground bg-foreground text-primary-foreground"
                    : "border-border hover:bg-secondary",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="panel p-8 text-center text-sm text-muted-foreground">
            Nothing matches that search.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {rows.map((item) => (
              <InstrumentCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {hydrated && !premium ? (
          <div className="panel relative overflow-hidden p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-lg">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
                  <Sparkles className="size-3" aria-hidden /> Premium
                </span>
                <h2 className="mt-3 text-lg font-bold">Deep research on any instrument</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Rolling-return analysis, drawdown history, holdings overlap with what you already
                  own, and a plain-English read on whether it suits your risk profile.
                </p>
              </div>
              <Link
                to="/premium"
                className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Unlock deeper planning
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3" aria-hidden>
              {["Rolling returns", "Drawdown profile", "Overlap with your portfolio"].map((t) => (
                <div key={t} className="rounded-lg border border-border bg-secondary/50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-ink-soft">
                    <Lock className="size-3.5" aria-hidden /> {t}
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="h-2 w-full rounded bg-border" />
                    <div className="h-2 w-2/3 rounded bg-border" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

function InstrumentCard({ item }: { item: InvestmentInstrument }) {
  const values = item.history.map((h) => h.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * 100;
      const y = 28 - ((v - min) / Math.max(1, max - min)) * 26;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const riskTone =
    item.risk === "Low" ? "text-positive" : item.risk === "Moderate" ? "text-accent" : "text-warning";

  return (
    <article className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {item.category} · {item.subCategory}
          </p>
        </div>
        <svg viewBox="0 0 100 30" className="h-8 w-24 shrink-0" role="img" aria-label="Trend">
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-accent"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="3Y return" value={formatPercent(item.return3y)} />
        <Metric label="5Y return" value={formatPercent(item.return5y)} />
        <Metric label="Risk" value={item.risk} className={riskTone} />
        <Metric label="Expense" value={formatPercent(item.expenseRatio, 2)} />
      </dl>
    </article>
  );
}

function Metric({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <dt className="label-caps">{label}</dt>
      <dd className={cn("figure-md mt-1 text-sm", className)}>{value}</dd>
    </div>
  );
}
