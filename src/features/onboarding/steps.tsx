import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Trash2 } from "lucide-react";
import { MoneyInput, TextField } from "@/components/finance/MoneyInput";
import { Choice, GoalBuilder } from "@/features/goals/GoalBuilder";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { MoneyFlow } from "@/components/finance/MoneyFlow";
import { GOAL_META } from "@/components/finance/goalMeta";
import { usePlanStore } from "@/store/planStore";
import { usePlan } from "@/hooks/usePlan";
import { formatCompactINR, formatINR, formatMonthYear } from "@/lib/format";
import type { AssetType, LoanType, RiskProfile } from "@/types/finance";

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between rounded-lg bg-accent-soft px-4 py-3">
      <p className="text-sm font-medium text-ink-soft">{label}</p>
      <AnimatedNumber value={value} className="figure-xl text-2xl text-accent" duration={0.45} />
    </div>
  );
}

const Row = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="panel-quiet p-4"
  >
    {children}
  </motion.div>
);

const DeleteButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-critical-soft hover:text-critical"
  >
    <Trash2 className="size-4" aria-hidden />
  </button>
);

const AddButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
  >
    <Plus className="size-4" aria-hidden />
    {children}
  </button>
);

export function IncomeStep() {
  const { profile, summary } = usePlan();
  const { addIncome, updateIncome, removeIncome } = usePlanStore.getState();
  return (
    <div className="space-y-4">
      {profile.incomes.map((i) => (
        <Row key={i.id}>
          <div className="flex items-end gap-3">
            <TextField
              label="Source"
              value={i.label}
              onChange={(v) => updateIncome(i.id, { label: v })}
              className="flex-1"
            />
            <MoneyInput
              label="Per month"
              value={i.amount}
              onChange={(v) => updateIncome(i.id, { amount: v })}
              suffix="/mo"
              className="w-40"
            />
            {profile.incomes.length > 1 ? (
              <DeleteButton onClick={() => removeIncome(i.id)} label={`Remove ${i.label}`} />
            ) : null}
          </div>
        </Row>
      ))}
      <AddButton onClick={addIncome}>Add another income source</AddButton>
      <Summary label="Total monthly income" value={summary.monthlyIncome} />
    </div>
  );
}

const EXPENSE_PRESETS = [
  "Housing",
  "Food",
  "Transportation",
  "Utilities",
  "Healthcare",
  "Insurance",
  "Family",
  "Travel",
  "Entertainment",
  "Subscriptions",
  "Other",
];

export function ExpenseStep() {
  const { profile, summary } = usePlan();
  const { addExpense, updateExpense, removeExpense } = usePlanStore.getState();
  const existing = new Set(profile.expenses.map((e) => e.category));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {profile.expenses.map((e) => (
          <Row key={e.id}>
            <div className="flex items-end gap-2">
              <MoneyInput
                label={e.category}
                value={e.amount}
                onChange={(v) => updateExpense(e.id, { amount: v })}
                className="flex-1"
              />
              <DeleteButton onClick={() => removeExpense(e.id)} label={`Remove ${e.category}`} />
            </div>
            <div className="mt-3">
              <Choice
                label="Type"
                value={e.kind}
                options={[
                  ["essential", "Essential"],
                  ["discretionary", "Discretionary"],
                ]}
                onChange={(v) => updateExpense(e.id, { kind: v as "essential" | "discretionary" })}
              />
            </div>
          </Row>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {EXPENSE_PRESETS.filter((p) => !existing.has(p)).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => addExpense(p)}
            className="rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-accent hover:text-accent"
          >
            + {p}
          </button>
        ))}
      </div>

      <div className="panel p-5">
        <p className="label-caps">Where your money goes</p>
        <MoneyFlow
          className="mt-3"
          steps={[
            { label: "Monthly income", amount: summary.monthlyIncome },
            { label: "Essential", amount: summary.essentialExpenses, tone: "out" },
            { label: "Discretionary", amount: summary.discretionaryExpenses, tone: "out" },
            { label: "EMIs", amount: summary.emiTotal, tone: "out" },
            { label: "Available", amount: summary.surplus, tone: "available" },
          ]}
        />
      </div>
    </div>
  );
}

const LOAN_TYPES: [LoanType, string][] = [
  ["home", "Home"],
  ["car", "Car"],
  ["personal", "Personal"],
  ["education", "Education"],
  ["other", "Other"],
];

export function DebtStep() {
  const { profile, summary } = usePlan();
  const { addLoan, updateLoan, removeLoan } = usePlanStore.getState();
  const longest = Math.max(0, ...profile.loans.map((l) => l.remainingMonths));

  return (
    <div className="space-y-4">
      {profile.loans.length === 0 ? (
        <div className="panel-quiet p-6 text-center">
          <p className="text-sm font-medium">No EMIs yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            If you have any loans, add them so your available money is realistic.
          </p>
        </div>
      ) : null}

      {profile.loans.map((l) => (
        <Row key={l.id}>
          <div className="flex items-start justify-between gap-3">
            <TextField
              label="Loan name"
              value={l.name}
              onChange={(v) => updateLoan(l.id, { name: v })}
              className="flex-1"
            />
            <DeleteButton onClick={() => removeLoan(l.id)} label={`Remove ${l.name}`} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {LOAN_TYPES.map(([t, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => updateLoan(l.id, { type: t })}
                aria-pressed={l.type === t}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  l.type === t ? "border-accent bg-accent-soft text-accent" : "border-border"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <MoneyInput
              label="Outstanding"
              value={l.outstanding}
              onChange={(v) => updateLoan(l.id, { outstanding: v })}
              step={50000}
            />
            <MoneyInput
              label="Monthly EMI"
              value={l.emi}
              onChange={(v) => updateLoan(l.id, { emi: v })}
              suffix="/mo"
            />
            <MoneyInput
              label="Interest rate"
              value={l.interestRate}
              onChange={(v) => updateLoan(l.id, { interestRate: v })}
              prefix="%"
              step={0.1}
            />
            <MoneyInput
              label="Months remaining"
              value={l.remainingMonths}
              onChange={(v) => updateLoan(l.id, { remainingMonths: v })}
              prefix="#"
              step={1}
            />
          </div>
        </Row>
      ))}

      <AddButton onClick={addLoan}>Add a loan</AddButton>

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="Total EMI / month" value={summary.emiTotal} />
        <div className="flex items-baseline justify-between rounded-lg bg-secondary px-4 py-3">
          <p className="text-sm text-ink-soft">Outstanding debt</p>
          <p className="figure-md text-lg">{formatCompactINR(summary.debtOutstanding)}</p>
        </div>
        <div className="flex items-baseline justify-between rounded-lg bg-secondary px-4 py-3">
          <p className="text-sm text-ink-soft">Longest tenure</p>
          <p className="figure-md text-lg">{Math.round(longest / 12)} yrs</p>
        </div>
      </div>
    </div>
  );
}

export function CardStep() {
  const { profile } = usePlan();
  const updateCard = usePlanStore((s) => s.updateCard);
  const c = profile.creditCard;

  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <Choice
          label="How do you usually pay your card bill?"
          value={c.revolves ? "revolve" : "full"}
          options={[
            ["full", "In full"],
            ["revolve", "I carry a balance"],
          ]}
          onChange={(v) => updateCard({ revolves: v === "revolve" })}
        />
        <p className="mt-3 rounded-lg bg-secondary px-4 py-3 text-sm text-ink-soft">
          If you usually pay your card bill in full, your credit card is treated as a spending
          method rather than debt. If you carry a balance, it's treated as high-interest debt and
          takes priority over goal funding.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Row>
          <MoneyInput
            label="Current outstanding"
            value={c.outstanding}
            onChange={(v) => updateCard({ outstanding: v })}
            step={1000}
          />
        </Row>
        <Row>
          <MoneyInput
            label="Average monthly bill"
            value={c.averageBill}
            onChange={(v) => updateCard({ averageBill: v })}
            step={1000}
          />
        </Row>
        <Row>
          <MoneyInput
            label="Minimum due"
            value={c.minimumDue}
            onChange={(v) => updateCard({ minimumDue: v })}
            step={500}
          />
        </Row>
        <Row>
          <MoneyInput
            label="Typical monthly payment"
            value={c.typicalPayment}
            onChange={(v) => updateCard({ typicalPayment: v })}
            step={1000}
          />
        </Row>
      </div>
      <p className="text-xs text-muted-foreground">
        We never ask for card numbers — only the amounts that affect your monthly capacity.
      </p>
    </div>
  );
}

const ASSET_TYPES: [AssetType, string][] = [
  ["savings", "Savings"],
  ["fd", "Fixed deposit"],
  ["mutual-fund", "Mutual funds"],
  ["stocks", "Stocks"],
  ["epf", "EPF"],
  ["ppf", "PPF"],
  ["nps", "NPS"],
  ["gold", "Gold"],
  ["other", "Other"],
];

export function AssetsStep() {
  const { profile, summary } = usePlan();
  const { addAsset, updateAsset, removeAsset } = usePlanStore.getState();

  return (
    <div className="space-y-4">
      {profile.assets.map((a) => (
        <Row key={a.id}>
          <div className="flex items-end gap-3">
            <TextField
              label="Holding"
              value={a.name}
              onChange={(v) => updateAsset(a.id, { name: v })}
              className="flex-1"
            />
            <MoneyInput
              label="Current value"
              value={a.value}
              onChange={(v) => updateAsset(a.id, { value: v })}
              className="w-44"
              step={10000}
            />
            <DeleteButton onClick={() => removeAsset(a.id)} label={`Remove ${a.name}`} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-ink-soft" htmlFor={`type-${a.id}`}>
                Type
              </label>
              <select
                id={`type-${a.id}`}
                value={a.type}
                onChange={(e) => updateAsset(a.id, { type: e.target.value as AssetType })}
                className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-accent"
              >
                {ASSET_TYPES.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-soft" htmlFor={`goal-${a.id}`}>
                Assign to a goal (optional)
              </label>
              <select
                id={`goal-${a.id}`}
                value={a.goalId ?? ""}
                onChange={(e) => updateAsset(a.id, { goalId: e.target.value || undefined })}
                className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-accent"
              >
                <option value="">Not assigned</option>
                {profile.goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Row>
      ))}
      <AddButton onClick={addAsset}>Add a holding</AddButton>
      <Summary label="Total existing assets" value={summary.assetsTotal} />
    </div>
  );
}

export function EmergencyStep() {
  const { profile, summary } = usePlan();
  const setEmergencySavings = usePlanStore((s) => s.setEmergencySavings);

  return (
    <div className="space-y-4">
      <Row>
        <MoneyInput
          label="Current emergency savings"
          value={profile.emergencySavings}
          onChange={setEmergencySavings}
          step={25000}
        />
      </Row>

      <div className="panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label-caps">Emergency fund</p>
            <p className="figure-xl mt-1 text-3xl">
              {formatINR(profile.emergencySavings)}{" "}
              <span className="text-base font-medium text-muted-foreground">
                / {formatINR(summary.emergencyTarget)}
              </span>
            </p>
          </div>
          <p className="figure-md text-2xl text-positive">
            {Math.round(summary.emergencyProgress)}%
          </p>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-positive"
            initial={{ width: 0 }}
            animate={{ width: `${summary.emergencyProgress}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-secondary px-3 py-2">
            <dt className="label-caps">Monthly essentials + EMIs</dt>
            <dd className="figure-md mt-0.5">
              {formatINR(summary.essentialExpenses + summary.emiTotal)}
            </dd>
          </div>
          <div className="rounded-lg bg-secondary px-3 py-2">
            <dt className="label-caps">Recommended (6 months)</dt>
            <dd className="figure-md mt-0.5">{formatINR(summary.emergencyTarget)}</dd>
          </div>
          <div className="rounded-lg bg-secondary px-3 py-2">
            <dt className="label-caps">Funding gap</dt>
            <dd className="figure-md mt-0.5 text-warning">{formatINR(summary.emergencyGap)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          A six-month buffer of essentials and EMIs is a common starting range. Your plan tops this
          up before funding longer-term goals.
        </p>
      </div>
    </div>
  );
}

export function GoalsStep() {
  const { profile, plan } = usePlan();
  const removeGoal = usePlanStore((s) => s.removeGoal);
  const [building, setBuilding] = useState(profile.goals.length === 0);

  return (
    <div className="space-y-4">
      {profile.goals.length === 0 && !building ? (
        <div className="panel-quiet p-8 text-center">
          <h3 className="text-lg font-semibold">What are you planning for?</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Add your first goal and we'll help you understand what it may take to get there.
          </p>
          <button
            type="button"
            onClick={() => setBuilding(true)}
            className="mt-5 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Add a Goal
          </button>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {profile.goals.map((g) => {
          const p = plan.projections.find((x) => x.goalId === g.id);
          const Icon = GOAL_META[g.category].icon;
          return (
            <Row key={g.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 size-5" style={{ color: GOAL_META[g.category].accent }} aria-hidden />
                  <div>
                    <p className="font-semibold">{g.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCompactINR(g.targetAmount)} · {formatMonthYear(g.targetDate)}
                    </p>
                    <p className="figure-md mt-2 text-lg">
                      {formatINR(p?.requiredMonthly ?? 0)}
                      <span className="text-xs font-normal text-muted-foreground">/month needed</span>
                    </p>
                  </div>
                </div>
                <DeleteButton onClick={() => removeGoal(g.id)} label={`Remove ${g.name}`} />
              </div>
            </Row>
          );
        })}
      </div>

      {building ? (
        <GoalBuilder onDone={() => setBuilding(false)} onCancel={() => setBuilding(false)} />
      ) : (
        <AddButton onClick={() => setBuilding(true)}>Add a goal</AddButton>
      )}
    </div>
  );
}

const RISK_QUESTIONS: {
  q: string;
  options: { label: string; score: number }[];
}[] = [
  {
    q: "If your investment temporarily fell 15%, what would you most likely do?",
    options: [
      { label: "Stay invested", score: 3 },
      { label: "Invest a little more", score: 4 },
      { label: "Reduce my investment", score: 2 },
      { label: "Sell", score: 1 },
    ],
  },
  {
    q: "How would you describe your comfort with month-to-month ups and downs?",
    options: [
      { label: "I barely notice them", score: 4 },
      { label: "Fine if the long-term plan holds", score: 3 },
      { label: "They make me uneasy", score: 2 },
      { label: "I'd rather avoid them", score: 1 },
    ],
  },
  {
    q: "When do you expect to need most of this money?",
    options: [
      { label: "More than 15 years away", score: 4 },
      { label: "8–15 years", score: 3 },
      { label: "3–7 years", score: 2 },
      { label: "Within 3 years", score: 1 },
    ],
  },
];

const PROFILES: { key: RiskProfile; label: string; blurb: string }[] = [
  { key: "conservative", label: "Conservative", blurb: "Stability first, lower expected return." },
  { key: "moderate", label: "Moderate", blurb: "Balanced mix of growth and stability." },
  { key: "growth", label: "Growth", blurb: "Growth-leaning, comfortable with swings." },
  { key: "aggressive", label: "Aggressive", blurb: "Maximum growth focus, high variability." },
];

export function RiskStep() {
  const risk = usePlanStore((s) => s.profile.risk);
  const setRisk = usePlanStore((s) => s.setRisk);
  const [answers, setAnswers] = useState<number[]>([]);

  const answer = (i: number, score: number) => {
    const next = [...answers];
    next[i] = score;
    setAnswers(next);
    const filled = next.filter(Boolean);
    if (filled.length === RISK_QUESTIONS.length) {
      const avg = filled.reduce((a, b) => a + b, 0) / filled.length;
      setRisk(avg >= 3.6 ? "aggressive" : avg >= 3 ? "growth" : avg >= 2 ? "moderate" : "conservative");
    }
  };

  return (
    <div className="space-y-4">
      {RISK_QUESTIONS.map((q, i) => (
        <Row key={q.q}>
          <p className="text-sm font-semibold">{q.q}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {q.options.map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => answer(i, o.score)}
                aria-pressed={answers[i] === o.score}
                className={`rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  answers[i] === o.score
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border hover:bg-secondary"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Row>
      ))}

      <div className="panel p-5">
        <p className="label-caps">Your risk profile</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {PROFILES.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setRisk(p.key)}
              aria-pressed={risk === p.key}
              className={`rounded-lg border p-3 text-left transition-colors ${
                risk === p.key ? "border-accent bg-accent-soft" : "border-border hover:bg-secondary"
              }`}
            >
              <p className="text-sm font-semibold">{p.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.blurb}</p>
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          This sets the return assumption used in your projections. It is not a recommendation to
          buy any specific investment.
        </p>
      </div>
    </div>
  );
}
