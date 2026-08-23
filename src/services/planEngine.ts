/**
 * All financial computation lives here — never in UI components.
 * This module mirrors the contract the Spring Boot backend will expose, so it
 * can be swapped for real API responses without touching any screen.
 */
import type {
  Allocation,
  CashflowSummary,
  FinancialProfile,
  Goal,
  GoalProjection,
  GoalStatus,
  MonthlyPlan,
  RiskProfile,
  ScenarioInput,
  ScenarioResult,
} from "@/types/finance";
import { addMonths, monthsBetween } from "@/lib/format";

export const RETURN_ASSUMPTIONS: Record<RiskProfile, number> = {
  conservative: 7,
  moderate: 9,
  growth: 11,
  aggressive: 12.5,
};

const CHART_TOKENS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export function computeSummary(profile: FinancialProfile): CashflowSummary {
  const monthlyIncome = sum(profile.incomes.map((i) => i.amount));
  const essentialExpenses = sum(
    profile.expenses.filter((e) => e.kind === "essential").map((e) => e.amount),
  );
  const discretionaryExpenses = sum(
    profile.expenses.filter((e) => e.kind === "discretionary").map((e) => e.amount),
  );
  const emiTotal = sum(profile.loans.map((l) => l.emi));
  const cardPayment = profile.creditCard.revolves
    ? Math.max(profile.creditCard.typicalPayment, profile.creditCard.minimumDue)
    : 0;
  const committed = essentialExpenses + discretionaryExpenses + emiTotal + cardPayment;
  const surplus = Math.max(0, monthlyIncome - committed);
  const assetsTotal = sum(profile.assets.map((a) => a.value));
  const debtOutstanding =
    sum(profile.loans.map((l) => l.outstanding)) + profile.creditCard.outstanding;

  const emergencyTarget = Math.round((essentialExpenses + emiTotal) * 6);
  const emergencyGap = Math.max(0, emergencyTarget - profile.emergencySavings);
  const emergencyProgress = emergencyTarget
    ? Math.min(100, (profile.emergencySavings / emergencyTarget) * 100)
    : 100;

  const savingsRate = monthlyIncome ? (surplus / monthlyIncome) * 100 : 0;

  return {
    monthlyIncome,
    essentialExpenses,
    discretionaryExpenses,
    emiTotal,
    cardPayment,
    committed,
    surplus,
    assetsTotal,
    debtOutstanding,
    emergencyTarget,
    emergencyGap,
    emergencyProgress,
    savingsRate,
    healthScore: healthScore({
      savingsRate,
      emergencyProgress,
      emiRatio: monthlyIncome ? (emiTotal / monthlyIncome) * 100 : 0,
      revolves: profile.creditCard.revolves,
      hasGoals: profile.goals.length > 0,
    }),
  };
}

function healthScore(i: {
  savingsRate: number;
  emergencyProgress: number;
  emiRatio: number;
  revolves: boolean;
  hasGoals: boolean;
}): number {
  const savings = Math.min(35, (i.savingsRate / 30) * 35);
  const emergency = Math.min(25, (i.emergencyProgress / 100) * 25);
  const debt = Math.max(0, 25 - (Math.max(0, i.emiRatio - 15) / 25) * 25);
  const cards = i.revolves ? 5 : 10;
  const planning = i.hasGoals ? 5 : 0;
  return Math.round(Math.min(100, savings + emergency + debt + cards + planning));
}

/** Future value of a lump sum. */
function fv(present: number, annualRatePct: number, months: number): number {
  const r = annualRatePct / 100 / 12;
  return present * Math.pow(1 + r, months);
}

/** Future value of a monthly SIP with an optional annual step-up (%). */
export function sipFutureValue(
  monthly: number,
  annualRatePct: number,
  months: number,
  annualStepUpPct = 0,
): number {
  const r = annualRatePct / 100 / 12;
  let balance = 0;
  let contribution = monthly;
  for (let m = 0; m < months; m++) {
    if (m > 0 && m % 12 === 0) contribution *= 1 + annualStepUpPct / 100;
    balance = (balance + contribution) * (1 + r);
  }
  return balance;
}

/** Monthly contribution needed to reach `target` in `months`. */
export function requiredSip(target: number, annualRatePct: number, months: number): number {
  if (months <= 0) return target;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return target / months;
  return (target * r) / ((Math.pow(1 + r, months) - 1) * (1 + r));
}

export function projectGoal(
  goal: Goal,
  risk: RiskProfile,
  assignedAssets = 0,
  now = new Date(),
): GoalProjection {
  const assumedReturn = RETURN_ASSUMPTIONS[risk];
  const monthsRemaining = monthsBetween(now, goal.targetDate);
  const startingCorpus = goal.savedAmount + assignedAssets;
  const futureValueOfSaved = fv(startingCorpus, assumedReturn, monthsRemaining);
  const amountStillNeeded = Math.max(0, goal.targetAmount - futureValueOfSaved);
  return {
    goalId: goal.id,
    monthsRemaining,
    futureValueOfSaved,
    amountStillNeeded,
    requiredMonthly: Math.round(requiredSip(amountStillNeeded, assumedReturn, monthsRemaining)),
    assumedReturn,
  };
}

export function goalStatus(allocated: number, required: number): GoalStatus {
  if (required <= 0) return "on-track";
  const ratio = allocated / required;
  if (ratio >= 0.98) return "on-track";
  if (ratio >= 0.6) return "at-risk";
  return "not-feasible";
}

/**
 * Priority-weighted monthly allocation:
 * 1. Emergency-fund top-up first (gap spread over 18 months, capped at 15% of surplus)
 * 2. A small buffer is always reserved
 * 3. The rest is distributed across goals, weighted by priority, never above requirement
 * 4. Anything left over flows back into the highest priority unfunded goals
 */
export function buildMonthlyPlan(profile: FinancialProfile, now = new Date()): MonthlyPlan {
  const summary = computeSummary(profile);
  const available = summary.surplus;

  const assetsByGoal = new Map<string, number>();
  for (const a of profile.assets) {
    if (a.goalId) assetsByGoal.set(a.goalId, (assetsByGoal.get(a.goalId) ?? 0) + a.value);
  }

  const projections = profile.goals.map((g) =>
    projectGoal(g, profile.risk, assetsByGoal.get(g.id) ?? 0, now),
  );
  const totalRequired = sum(projections.map((p) => p.requiredMonthly));

  const allocations: Allocation[] = [];
  let remaining = available;

  const emergencyNeed = summary.emergencyGap > 0 ? Math.ceil(summary.emergencyGap / 18) : 0;
  const emergencyAlloc = Math.min(emergencyNeed, Math.round(available * 0.15));
  if (emergencyAlloc > 0) {
    allocations.push({
      id: "emergency",
      label: "Emergency Fund",
      amount: emergencyAlloc,
      kind: "emergency",
      requiredMonthly: emergencyNeed,
      colorToken: "var(--chart-2)",
    });
    remaining -= emergencyAlloc;
  }

  const buffer = Math.min(Math.round(available * 0.06), Math.max(0, remaining));
  remaining -= buffer;

  const weightOf = (p: 1 | 2 | 3) => (p === 1 ? 3 : p === 2 ? 2 : 1);
  const ranked = profile.goals
    .map((g, idx) => ({
      goal: g,
      projection: projections[idx]!,
      weight: weightOf(g.priority),
    }))
    .sort((a, b) => b.weight - a.weight || a.projection.monthsRemaining - b.projection.monthsRemaining);

  const weightedTotal = sum(ranked.map((r) => r.weight * r.projection.requiredMonthly));
  const draft = ranked.map((r) => {
    const share = weightedTotal
      ? (r.weight * r.projection.requiredMonthly) / weightedTotal
      : 0;
    const want = r.projection.requiredMonthly;
    return { ...r, amount: Math.min(want, Math.round(remaining * share)) };
  });

  let leftover = remaining - sum(draft.map((d) => d.amount));
  for (const d of draft) {
    if (leftover <= 0) break;
    const room = d.projection.requiredMonthly - d.amount;
    const give = Math.min(room, leftover);
    d.amount += give;
    leftover -= give;
  }

  draft.forEach((d, i) => {
    allocations.push({
      id: d.goal.id,
      label: d.goal.name,
      amount: Math.max(0, d.amount),
      kind: "goal",
      goalId: d.goal.id,
      requiredMonthly: d.projection.requiredMonthly,
      status: goalStatus(d.amount, d.projection.requiredMonthly),
      colorToken: CHART_TOKENS[(i + 0) % CHART_TOKENS.length]!,
    });
  });

  const bufferAmount = buffer + Math.max(0, leftover);
  if (bufferAmount > 0) {
    allocations.push({
      id: "buffer",
      label: "Buffer",
      amount: bufferAmount,
      kind: "buffer",
      colorToken: "var(--muted-foreground)",
    });
  }

  const totalAllocated = sum(allocations.map((a) => a.amount));

  return {
    available,
    allocations,
    totalAllocated,
    totalRequired,
    fundingGap: Math.max(0, totalRequired + emergencyNeed - available),
    projections,
  };
}

export function runScenario(input: ScenarioInput, now = new Date()): ScenarioResult {
  const months = monthsBetween(now, input.targetDate);
  const projectedCorpus = Math.round(
    sipFutureValue(input.monthlyInvestment, input.expectedReturn, months, input.annualStepUp),
  );
  const fundingGap = Math.max(0, input.targetAmount - projectedCorpus);

  let monthsToGoal = months;
  if (fundingGap > 0) {
    for (let m = months; m <= months + 360; m++) {
      const v = sipFutureValue(
        input.monthlyInvestment,
        input.expectedReturn,
        m,
        input.annualStepUp,
      );
      if (v >= input.targetAmount) {
        monthsToGoal = m;
        break;
      }
      monthsToGoal = m;
    }
  }

  return {
    projectedCorpus,
    fundingGap,
    monthsToGoal,
    achievedByLabel: addMonths(now, monthsToGoal),
    status: goalStatus(projectedCorpus, input.targetAmount),
  };
}
