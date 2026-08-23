import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";

const SCENES = [
  {
    income: 200000,
    commitments: 120000,
    available: 80000,
    goals: [
      { label: "Car", amount: 20000, color: "var(--chart-1)" },
      { label: "Education", amount: 15000, color: "var(--chart-5)" },
      { label: "Retirement", amount: 30000, color: "var(--chart-2)" },
      { label: "Travel", amount: 5000, color: "var(--chart-6)" },
    ],
  },
  {
    income: 240000,
    commitments: 125000,
    available: 115000,
    goals: [
      { label: "Car", amount: 26000, color: "var(--chart-1)" },
      { label: "Education", amount: 24000, color: "var(--chart-5)" },
      { label: "Retirement", amount: 46000, color: "var(--chart-2)" },
      { label: "Travel", amount: 9000, color: "var(--chart-6)" },
    ],
  },
];

/** Animated income → commitments → available → goals → allocation flow. */
export function HeroFlowVisual() {
  const reduced = useReducedMotion();
  const [scene, setScene] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setScene((s) => (s + 1) % SCENES.length), 5200);
    return () => clearInterval(t);
  }, [reduced]);

  const s = SCENES[scene]!;
  const total = s.goals.reduce((a, b) => a + b.amount, 0);

  return (
    <div className="panel relative overflow-hidden p-5 sm:p-7">
      <div className="absolute inset-0 grid-paper opacity-40" aria-hidden />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="label-caps">Your money, every month</p>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
            live example
          </span>
        </div>

        <div className="mt-5 space-y-1">
          <Row label="Income" value={s.income} tone="ink" />
          <Connector />
          <Row label="Commitments" value={s.commitments} tone="soft" negative />
          <Connector />
          <Row label="Available to allocate" value={s.available} tone="accent" highlight />
        </div>

        <div className="mt-5">
          <div className="flex h-3 gap-1 overflow-hidden rounded-full bg-secondary p-0.5">
            {s.goals.map((g) => (
              <motion.span
                key={g.label}
                className="rounded-full"
                style={{ background: g.color, flexBasis: 0 }}
                animate={{ flexGrow: (g.amount / total) * 100 }}
                transition={{ type: "spring", stiffness: 150, damping: 24 }}
              />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {s.goals.map((g) => (
              <div key={g.label} className="rounded-lg border border-border px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: g.color }} aria-hidden />
                  <p className="truncate text-xs text-ink-soft">{g.label}</p>
                </div>
                <AnimatedNumber
                  value={g.amount}
                  format="compact"
                  className="figure-md mt-0.5 block text-base"
                />
              </div>
            ))}
          </div>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          Illustrative figures. Projected values are estimates based on the assumptions shown, not
          guaranteed returns.
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
  negative,
  highlight,
}: {
  label: string;
  value: number;
  tone: "ink" | "soft" | "accent";
  negative?: boolean;
  highlight?: boolean;
}) {
  const color = tone === "accent" ? "text-accent" : tone === "soft" ? "text-ink-soft" : "text-foreground";
  return (
    <div
      className={`flex items-baseline justify-between gap-4 rounded-lg px-3 py-2.5 ${
        highlight ? "bg-accent-soft" : ""
      }`}
    >
      <p className="text-sm font-medium text-ink-soft">{label}</p>
      <span className={`figure-xl text-2xl sm:text-3xl ${color}`}>
        {negative ? <span className="mr-1 opacity-40">−</span> : null}
        <AnimatedNumber value={value} />
      </span>
    </div>
  );
}

function Connector() {
  return (
    <div className="ml-4 h-4" aria-hidden>
      <svg width="2" height="16" className="overflow-visible">
        <line x1="1" y1="0" x2="1" y2="16" className="flow-dash stroke-accent/70" strokeWidth="2" />
      </svg>
    </div>
  );
}
