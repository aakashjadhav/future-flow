import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { StatusPill } from "@/components/finance/StatusPill";
import { GOAL_META } from "@/components/finance/goalMeta";
import { formatCompactINR, formatINR, formatMonthYear } from "@/lib/format";
import type { Goal, GoalProjection, GoalStatus } from "@/types/finance";

export function GoalCard({
  goal,
  projection,
  allocated,
  status,
  index = 0,
}: {
  goal: Goal;
  projection: GoalProjection;
  allocated: number;
  status: GoalStatus;
  index?: number;
}) {
  const meta = GOAL_META[goal.category];
  const Icon = meta.icon;
  const progress = Math.min(100, (goal.savedAmount / Math.max(1, goal.targetAmount)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="panel group relative overflow-hidden p-5 transition-shadow hover:shadow-lift"
    >
      <span
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: meta.accent }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid size-10 place-items-center rounded-lg"
            style={{ background: `color-mix(in oklab, ${meta.accent} 12%, transparent)` }}
          >
            <Icon className="size-5" style={{ color: meta.accent }} aria-hidden />
          </span>
          <div>
            <h3 className="text-base font-semibold">{goal.name}</h3>
            <p className="text-xs text-muted-foreground">
              {formatCompactINR(goal.targetAmount)} · {formatMonthYear(goal.targetDate)}
            </p>
          </div>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="label-caps">Recommended</p>
          <AnimatedNumber value={allocated} className="figure-md mt-1 block text-xl" />
          <p className="text-[11px] text-muted-foreground">per month</p>
        </div>
        <div>
          <p className="label-caps">Required</p>
          <p className="figure-md mt-1 text-xl text-ink-soft">
            {formatINR(projection.requiredMonthly)}
          </p>
          <p className="text-[11px] text-muted-foreground">per month</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCompactINR(goal.savedAmount)} saved</span>
          <span className="num">{Math.round(progress)}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full"
            style={{ background: meta.accent }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          />
        </div>
      </div>

      <Link
        to="/goal/$goalId"
        params={{ goalId: goal.id }}
        className="mt-4 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
      >
        View goal detail →
      </Link>
    </motion.div>
  );
}
