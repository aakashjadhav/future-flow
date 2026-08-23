/**
 * API surface consumed by the UI. Each function maps 1:1 to a planned
 * Spring Boot endpoint; the local branch is the mock adapter.
 *
 *  GET  /api/v1/profile
 *  POST /api/v1/income | /expenses | /loans | /assets | /goals
 *  POST /api/v1/financial-plan/calculate
 *  POST /api/v1/scenarios
 *  GET  /api/v1/investments
 *  POST /api/v1/research
 */
import type {
  CashflowSummary,
  FinancialProfile,
  MonthlyPlan,
  ScenarioInput,
  ScenarioResult,
} from "@/types/finance";
import { buildMonthlyPlan, computeSummary, runScenario } from "./planEngine";
import { delay, request, useRemoteApi } from "./apiClient";
import { investmentInstruments, sampleProfile, type InvestmentInstrument } from "./mockData";

export const profileApi = {
  get: async (): Promise<FinancialProfile> =>
    useRemoteApi ? request<FinancialProfile>("/api/v1/profile") : delay(sampleProfile),
};

export const planApi = {
  summary: async (profile: FinancialProfile): Promise<CashflowSummary> =>
    useRemoteApi
      ? request<CashflowSummary>("/api/v1/financial-plan/summary", {
          method: "POST",
          body: profile,
        })
      : delay(computeSummary(profile), 200),

  calculate: async (profile: FinancialProfile): Promise<MonthlyPlan> =>
    useRemoteApi
      ? request<MonthlyPlan>("/api/v1/financial-plan/calculate", { method: "POST", body: profile })
      : delay(buildMonthlyPlan(profile), 400),
};

export const scenariosApi = {
  run: async (input: ScenarioInput): Promise<ScenarioResult> =>
    useRemoteApi
      ? request<ScenarioResult>("/api/v1/scenarios", { method: "POST", body: input })
      : delay(runScenario(input), 0),
};

export const investmentApi = {
  list: async (): Promise<InvestmentInstrument[]> =>
    useRemoteApi
      ? request<InvestmentInstrument[]>("/api/v1/investments")
      : delay(investmentInstruments, 250),
};

export interface CoachReply {
  answer: string;
  calculation?: { label: string; value: string }[];
  impact?: string;
  assumptions?: string;
}

export const coachApi = {
  ask: async (question: string, profile: FinancialProfile): Promise<CoachReply> => {
    if (useRemoteApi) {
      return request<CoachReply>("/api/v1/coach", { method: "POST", body: { question } });
    }
    const summary = computeSummary(profile);
    const plan = buildMonthlyPlan(profile);
    const goalMention = profile.goals.find((g) =>
      question.toLowerCase().includes(g.name.toLowerCase()),
    );
    if (goalMention) {
      const alloc = plan.allocations.find((a) => a.goalId === goalMention.id);
      return delay(
        {
          answer: `Your ${goalMention.name.toLowerCase()} goal currently receives ${inr(
            alloc?.amount ?? 0,
          )} a month out of the ${inr(
            alloc?.requiredMonthly ?? 0,
          )} it needs. Moving the target date later, or trimming discretionary spending, closes most of that difference.`,
          calculation: [
            { label: "Recommended allocation", value: `${inr(alloc?.amount ?? 0)}/month` },
            { label: "Required allocation", value: `${inr(alloc?.requiredMonthly ?? 0)}/month` },
            { label: "Goal status", value: (alloc?.status ?? "on-track").replace("-", " ") },
          ],
          impact: `Redirecting ${inr(
            Math.max(0, (alloc?.requiredMonthly ?? 0) - (alloc?.amount ?? 0)),
          )} from your buffer would bring this goal on track.`,
          assumptions: `Assumes ${plan.projections[0]?.assumedReturn ?? 9}% expected annual return. Projections are estimates, not guaranteed returns.`,
        },
        900,
      );
    }
    return delay(
      {
        answer: `You have ${inr(
          summary.surplus,
        )} available each month after essentials, EMIs and discretionary spending. Across your current goals the plan needs ${inr(
          plan.totalRequired,
        )}, which leaves a gap of ${inr(plan.fundingGap)} to work with.`,
        calculation: [
          { label: "Monthly income", value: inr(summary.monthlyIncome) },
          { label: "Committed", value: inr(summary.committed) },
          { label: "Available", value: inr(summary.surplus) },
        ],
        assumptions:
          "Based on the figures in your profile and the return assumptions shown on each goal.",
      },
      900,
    );
  },
};

function inr(v: number) {
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}
