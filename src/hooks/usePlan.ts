import { useMemo } from "react";
import { usePlanStore } from "@/store/planStore";
import { buildMonthlyPlan, computeSummary } from "@/services/planEngine";
import type { CashflowSummary, FinancialProfile, MonthlyPlan } from "@/types/finance";

/** Reactive view over the profile. Calculations stay in the engine/service layer. */
export function usePlan(): {
  profile: FinancialProfile;
  summary: CashflowSummary;
  plan: MonthlyPlan;
} {
  const profile = usePlanStore((s) => s.profile);
  const summary = useMemo(() => computeSummary(profile), [profile]);
  const plan = useMemo(() => buildMonthlyPlan(profile), [profile]);
  return { profile, summary, plan };
}
