import { useState } from "react";
import { motion } from "motion/react";
import { MoneyInput, TextField } from "@/components/finance/MoneyInput";
import { GOAL_CATEGORIES, GOAL_META } from "@/components/finance/goalMeta";
import { usePlanStore } from "@/store/planStore";
import { requiredSip, RETURN_ASSUMPTIONS } from "@/services/planEngine";
import { monthsBetween } from "@/lib/format";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import type { Goal, GoalCategory } from "@/types/finance";

const defaultTargetDate = () => {
  const d = new Date();
  return `${d.getFullYear() + 5}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export function GoalBuilder({ onDone, onCancel }: { onDone?: () => void; onCancel?: () => void }) {
  const addGoal = usePlanStore((s) => s.addGoal);
  const risk = usePlanStore((s) => s.profile.risk);

  const [draft, setDraft] = useState<Omit<Goal, "id">>({
    name: "",
    category: "car",
    targetAmount: 1500000,
    targetDate: defaultTargetDate(),
    savedAmount: 0,
    priority: 2,
    flexibility: "flexible",
  });

  const months = monthsBetween(new Date(), draft.targetDate);
  const preview = Math.round(
    requiredSip(
      Math.max(0, draft.targetAmount - draft.savedAmount),
      RETURN_ASSUMPTIONS[risk],
      months,
    ),
  );

  const set = <K extends keyof Omit<Goal, "id">>(k: K, v: Omit<Goal, "id">[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="panel p-5 sm:p-6"
    >
      <h3 className="text-base font-semibold">New goal</h3>

      <div className="mt-4 flex flex-wrap gap-2">
        {GOAL_CATEGORIES.map((c: GoalCategory) => {
          const Icon = GOAL_META[c].icon;
          const active = draft.category === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => {
                set("category", c);
                if (!draft.name) set("name", GOAL_META[c].label);
              }}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border hover:bg-secondary"
              }`}
            >
              <Icon className="size-3.5" aria-hidden />
              {GOAL_META[c].label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <TextField
          label="Goal name"
          value={draft.name}
          onChange={(v) => set("name", v)}
          placeholder={GOAL_META[draft.category].label}
        />
        <div>
          <label htmlFor="goal-date" className="text-xs font-medium text-ink-soft">
            Target date
          </label>
          <input
            id="goal-date"
            type="month"
            value={draft.targetDate}
            onChange={(e) => set("targetDate", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-base outline-none focus:border-accent"
          />
        </div>
        <MoneyInput
          label="Target amount"
          value={draft.targetAmount}
          onChange={(v) => set("targetAmount", v)}
          step={50000}
        />
        <MoneyInput
          label="Already saved for this goal"
          value={draft.savedAmount}
          onChange={(v) => set("savedAmount", v)}
          step={10000}
        />
        <Choice
          label="Priority"
          value={String(draft.priority)}
          options={[
            ["1", "High"],
            ["2", "Medium"],
            ["3", "Low"],
          ]}
          onChange={(v) => set("priority", Number(v) as 1 | 2 | 3)}
        />
        <Choice
          label="Date flexibility"
          value={draft.flexibility}
          options={[
            ["flexible", "Flexible"],
            ["fixed", "Fixed"],
          ]}
          onChange={(v) => set("flexibility", v as "fixed" | "flexible")}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-accent-soft px-4 py-3">
        <p className="text-sm text-ink-soft">
          To reach this goal you'd need roughly
          <br className="hidden sm:block" />
          <span className="text-xs">
            {months} months at {RETURN_ASSUMPTIONS[risk]}% assumed annual return
          </span>
        </p>
        <p className="figure-xl text-2xl text-accent">
          <AnimatedNumber value={preview} duration={0.5} />
          <span className="ml-1 text-xs font-medium">/month</span>
        </p>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          disabled={!draft.name || draft.targetAmount <= 0}
          onClick={() => {
            addGoal({ ...draft, name: draft.name || GOAL_META[draft.category].label });
            onDone?.();
          }}
          className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          Save goal
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}

export function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <div className="mt-1.5 flex gap-1 rounded-lg bg-secondary p-1" role="group" aria-label={label}>
        {options.map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={value === v}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              value === v ? "bg-card shadow-card" : "text-ink-soft hover:text-foreground"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
