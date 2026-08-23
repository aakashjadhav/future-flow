import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Slider } from "@/components/ui/slider";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { StatusPill } from "@/components/finance/StatusPill";
import { runScenario, RETURN_ASSUMPTIONS } from "@/services/planEngine";
import { formatMonthYear, monthsBetween } from "@/lib/format";
import type { Goal, RiskProfile } from "@/types/finance";

export function ScenarioSimulator({
  goal,
  risk,
  startingMonthly,
}: {
  goal: Goal;
  risk: RiskProfile;
  startingMonthly: number;
}) {
  const [monthly, setMonthly] = useState(Math.max(1000, startingMonthly));
  const [targetDate, setTargetDate] = useState(goal.targetDate);
  const [stepUp, setStepUp] = useState(5);
  const [targetAmount, setTargetAmount] = useState(goal.targetAmount);
  const [expectedReturn, setExpectedReturn] = useState(RETURN_ASSUMPTIONS[risk]);

  const result = useMemo(
    () =>
      runScenario({
        monthlyInvestment: monthly,
        targetDate,
        annualStepUp: stepUp,
        targetAmount,
        expectedReturn,
      }),
    [monthly, targetDate, stepUp, targetAmount, expectedReturn],
  );

  const monthsLeft = monthsBetween(new Date(), targetDate);
  const progress = Math.min(100, (result.projectedCorpus / Math.max(1, targetAmount)) * 100);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="panel p-5 sm:p-6">
        <p className="label-caps">Adjust the plan</p>
        <div className="mt-5 space-y-6">
          <SliderRow
            label="Monthly investment"
            display={`₹${monthly.toLocaleString("en-IN")}`}
            value={monthly}
            min={1000}
            max={Math.max(60000, startingMonthly * 3)}
            step={1000}
            onChange={setMonthly}
          />
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="sim-date" className="text-sm font-medium text-ink-soft">
                Target date
              </label>
              <span className="figure-md text-sm">{monthsLeft} months away</span>
            </div>
            <input
              id="sim-date"
              type="month"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="mt-2 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-base outline-none focus:border-accent"
            />
          </div>
          <SliderRow
            label="Annual contribution increase"
            display={`${stepUp}%`}
            value={stepUp}
            min={0}
            max={20}
            step={1}
            onChange={setStepUp}
          />
          <SliderRow
            label="Goal amount"
            display={`₹${targetAmount.toLocaleString("en-IN")}`}
            value={targetAmount}
            min={100000}
            max={Math.max(5000000, goal.targetAmount * 2)}
            step={100000}
            onChange={setTargetAmount}
          />
          <SliderRow
            label="Expected return assumption"
            display={`${expectedReturn}%`}
            value={expectedReturn}
            min={4}
            max={15}
            step={0.5}
            onChange={setExpectedReturn}
          />
        </div>
      </div>

      <div className="panel p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label-caps">Projected outcome</p>
            <AnimatedNumber
              value={result.projectedCorpus}
              format="compact"
              duration={0.5}
              className="figure-xl mt-2 block text-4xl"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              by {formatMonthYear(targetDate)} at {expectedReturn}% assumed annual return
            </p>
          </div>
          <StatusPill status={result.status} />
        </div>

        <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 130, damping: 22 }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {Math.round(progress)}% of the goal amount
        </p>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <Out label="Funding gap" value={result.fundingGap} tone={result.fundingGap ? "warning" : "positive"} />
          <div className="rounded-lg bg-secondary px-4 py-3">
            <dt className="label-caps">Goal completion</dt>
            <dd className="figure-md mt-1 text-lg">{formatMonthYear(result.achievedByLabel)}</dd>
          </div>
        </dl>

        <p className="mt-5 text-xs text-muted-foreground">
          Assumptions: {expectedReturn}% expected annual return, {stepUp}% annual increase in
          contributions. Projected values are estimates and are not guaranteed returns.
        </p>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  display,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  display: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-ink-soft">{label}</label>
        <span className="figure-md text-base">{display}</span>
      </div>
      <Slider
        className="mt-3"
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v ?? value)}
      />
    </div>
  );
}

function Out({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "warning" | "positive";
}) {
  return (
    <div className="rounded-lg bg-secondary px-4 py-3">
      <dt className="label-caps">{label}</dt>
      <dd>
        <AnimatedNumber
          value={value}
          format="compact"
          duration={0.4}
          className={`figure-md mt-1 block text-lg ${tone === "warning" ? "text-warning" : "text-positive"}`}
        />
      </dd>
    </div>
  );
}
