import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";
import { buildMonthlyPlan, computeSummary } from "@/services/planEngine";
import type { FinancialProfile } from "@/types/finance";

type ChatRequestBody = { messages?: unknown; profile?: FinancialProfile };

const inr = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`;

function buildContext(profile: FinancialProfile): string {
  const summary = computeSummary(profile);
  const plan = buildMonthlyPlan(profile);

  const goals = profile.goals
    .map((g) => {
      const alloc = plan.allocations.find((a) => a.goalId === g.id);
      const projection = plan.projections.find((p) => p.goalId === g.id);
      return [
        `- ${g.name} (${g.category}, priority ${g.priority}, ${g.flexibility})`,
        `target ${inr(g.targetAmount)} by ${g.targetDate}`,
        `already saved ${inr(g.savedAmount)}`,
        `required ${inr(projection?.requiredMonthly ?? 0)}/month at ${projection?.assumedReturn ?? 9}% expected return`,
        `plan allocates ${inr(alloc?.amount ?? 0)}/month`,
        `status ${alloc?.status ?? "on-track"}`,
        `${projection?.monthsRemaining ?? 0} months remaining`,
      ].join("; ");
    })
    .join("\n");

  return [
    "CASHFLOW (monthly)",
    `Income ${inr(summary.monthlyIncome)}; essentials ${inr(summary.essentialExpenses)}; discretionary ${inr(
      summary.discretionaryExpenses,
    )}; EMIs ${inr(summary.emiTotal)}; card payment ${inr(summary.cardPayment)}; committed ${inr(
      summary.committed,
    )}; surplus available ${inr(summary.surplus)}.`,
    `Savings rate ${summary.savingsRate.toFixed(1)}%; financial health score ${Math.round(summary.healthScore)}/100.`,
    "",
    "BALANCE SHEET",
    `Assets ${inr(summary.assetsTotal)}; debt outstanding ${inr(summary.debtOutstanding)}; emergency savings ${inr(
      profile.emergencySavings,
    )} against a target of ${inr(summary.emergencyTarget)} (gap ${inr(summary.emergencyGap)}).`,
    profile.loans.length
      ? `Loans: ${profile.loans
          .map(
            (l) =>
              `${l.name} (${l.type}) outstanding ${inr(l.outstanding)}, EMI ${inr(l.emi)}, ${l.interestRate}% for ${l.remainingMonths} more months`,
          )
          .join("; ")}.`
      : "No active loans.",
    "",
    "ALLOCATION PLAN",
    `Available ${inr(plan.available)}; allocated ${inr(plan.totalAllocated)}; total required ${inr(
      plan.totalRequired,
    )}; funding gap ${inr(plan.fundingGap)}.`,
    plan.allocations
      .map((a) => `- ${a.label}: ${inr(a.amount)}/month (${a.kind})`)
      .join("\n"),
    "",
    "GOALS",
    goals || "No goals defined yet.",
    "",
    `Risk profile: ${profile.risk}. Plan tier: ${profile.premium ? "premium" : "free"}.`,
  ].join("\n");
}

const SYSTEM_PROMPT = `You are Alloq's financial coach: a calm, precise, goal-based planning coach for an Indian user.

Rules you always follow:
- Ground every answer in the user's actual numbers given in the context below. Never invent figures.
- Show the maths. When you make a claim, include the short calculation that supports it (income minus commitments, required monthly SIP, months to goal, etc.).
- State the assumptions you used (expected return, inflation, target date) whenever a projection is involved.
- Use ₹ with Indian digit grouping, and be specific: amounts per month, dates, and month counts.
- Be concise and structured: a direct answer first, then the numbers, then the trade-off or next step.
- Use short markdown (bold labels, compact bullet lists, small tables when comparing options). Never write walls of text.
- If information is missing from the context, say exactly what to add in the profile instead of guessing.
- You give educational guidance, not regulated financial advice. Mention this only when the user asks for a recommendation to buy or sell a specific product.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        if (!body.profile) {
          return new Response("Profile is required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createLovableAiGatewayProvider(key, initialRunId);

        const result = streamText({
          model: gateway("google/gemini-3.7-flash"),
          system: `${SYSTEM_PROMPT}\n\n--- USER FINANCIAL CONTEXT (live, recomputed each turn) ---\n${buildContext(
            body.profile,
          )}`,
          messages: await convertToModelMessages(body.messages as UIMessage[]),
          abortSignal: request.signal,
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: body.messages as UIMessage[],
          headers: getLovableAiGatewayResponseHeaders(undefined, {
            ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
          }),
        });

        return withLovableAiGatewayRunIdHeader(response, gateway);
      },
    },
  },
});
