import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { StatusPill } from "@/components/finance/StatusPill";
import { runScenario } from "@/services/planEngine";
import { formatCompactINR, formatMonthYear } from "@/lib/format";

/** Interactive taste of the full scenario simulator, on the landing page. */
export function ScenarioPreview() {
  const [monthly, setMonthly] = useState(20000);
  const [years, setYears] = useState(6);

  const result = useMemo(() => {
    const now = new Date();
    const target = new Date(now.getFullYear() + years, now.getMonth(), 1);
    return runScenario({
      monthlyInvestment: monthly,
      targetAmount: 1500000,
      targetDate: `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}`,
      annualStepUp: 5,
      expectedReturn: 9,
    });
  }, [monthly, years]);

  return (
    <div className="panel p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-caps">Goal · Car</p>
          <p className="figure-md text-xl">₹15,00,000 target</p>
        </div>
        <StatusPill status={result.status} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="space-y-6">
          <Control
            label="Monthly investment"
            value={`₹${monthly.toLocaleString("en-IN")}`}
            min={5000}
            max={45000}
            step={1000}
            current={monthly}
            onChange={setMonthly}
            minLabel="₹5,000"
            maxLabel="₹45,000"
          />
          <Control
            label="Time horizon"
            value={`${years} years`}
            min={2}
            max={15}
            step={1}
            current={years}
            onChange={setYears}
            minLabel="2 yrs"
            maxLabel="15 yrs"
          />
        </div>

        <div className="grid gap-3 self-start">
          <Out label="Projected corpus" value={result.projectedCorpus} />
          <Out label="Funding gap" value={result.fundingGap} tone={result.fundingGap ? "warning" : "positive"} />
          <div className="rounded-lg bg-secondary px-4 py-3">
            <p className="label-caps">Goal completion</p>
            <p className="figure-md mt-1 text-lg">{formatMonthYear(result.achievedByLabel)}</p>
          </div>
        </div>
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Assumes 9% expected annual return and a 5% annual step-up. Estimates only — not guaranteed
        returns.
      </p>
    </div>
  );
}

function Control({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
  minLabel,
  maxLabel,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (v: number) => void;
  minLabel: string;
  maxLabel: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-ink-soft">{label}</label>
        <span className="figure-md text-base">{value}</span>
      </div>
      <Slider
        className="mt-3"
        value={[current]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v ?? current)}
        aria-label={label}
      />
      <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function Out({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "warning" | "positive";
}) {
  const color =
    tone === "warning" ? "text-warning" : tone === "positive" ? "text-positive" : "text-foreground";
  return (
    <div className="rounded-lg bg-secondary px-4 py-3">
      <p className="label-caps">{label}</p>
      <AnimatedNumber
        value={value}
        format="compact"
        duration={0.5}
        className={`figure-xl mt-1 block text-2xl ${color}`}
      />
      <p className="sr-only">{formatCompactINR(value)}</p>
    </div>
  );
}
