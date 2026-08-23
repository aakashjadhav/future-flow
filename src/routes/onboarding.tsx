import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useHydrated } from "@/hooks/useHydrated";
import { usePlanStore } from "@/store/planStore";
import {
  AssetsStep,
  CardStep,
  DebtStep,
  EmergencyStep,
  ExpenseStep,
  GoalsStep,
  IncomeStep,
  RiskStep,
} from "@/features/onboarding/steps";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Guided onboarding — Alloq" },
      {
        name: "description",
        content:
          "A short guided pass through income, expenses, debt, assets and goals so your monthly allocation can be built.",
      },
      { property: "og:title", content: "Guided onboarding — Alloq" },
      { property: "og:description", content: "Income, expenses, debt, assets, goals, risk." },
    ],
  }),
  component: Onboarding,
});

const STEPS = [
  { id: "income", n: "01", label: "Income", title: "Let's understand what comes in each month.", sub: "Add every recurring source. Your total updates as you type.", Component: IncomeStep },
  { id: "expenses", n: "02", label: "Expenses", title: "Where does your money go?", sub: "Mark each category as essential or discretionary.", Component: ExpenseStep },
  { id: "debt", n: "03", label: "Debt", title: "Do you currently have any EMIs?", sub: "EMIs reduce what's available to allocate, so they matter.", Component: DebtStep },
  { id: "cards", n: "04", label: "Cards", title: "How do you use your credit card?", sub: "Paying in full is treated very differently from revolving debt.", Component: CardStep },
  { id: "assets", n: "05", label: "Assets", title: "What's already working for you?", sub: "Existing savings and investments reduce what you need to add.", Component: AssetsStep },
  { id: "emergency", n: "06", label: "Buffer", title: "How much runway do you hold?", sub: "Your emergency fund is funded before longer-term goals.", Component: EmergencyStep },
  { id: "goals", n: "07", label: "Goals", title: "What are you planning for?", sub: "Amount, date, and how flexible each goal is.", Component: GoalsStep },
  { id: "risk", n: "08", label: "Risk", title: "How do you handle ups and downs?", sub: "Three behavioural questions — no jargon.", Component: RiskStep },
] as const;

function Onboarding() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const completeOnboarding = usePlanStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  const next = () => {
    if (isLast) {
      completeOnboarding();
      navigate({ to: "/analysis" });
      return;
    }
    setStep((s) => s + 1);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Logo />
            <p className="text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </p>
          </div>
          <nav className="-mx-1 flex gap-1 overflow-x-auto pb-3" aria-label="Onboarding progress">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(i)}
                aria-current={i === step ? "step" : undefined}
                className="group relative shrink-0 px-1 text-left"
              >
                <span
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase transition-colors ${
                    i === step
                      ? "bg-foreground text-primary-foreground"
                      : i < step
                        ? "text-positive"
                        : "text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="size-3" aria-hidden /> : s.n} {s.label}
                </span>
              </button>
            ))}
          </nav>
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full bg-accent"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.section
            key={current.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-2xl font-bold sm:text-3xl">{current.title}</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{current.sub}</p>
            <div className="mt-7">
              {hydrated ? <current.Component /> : <div className="h-64 animate-pulse rounded-xl bg-secondary" />}
            </div>
          </motion.section>
        </AnimatePresence>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            <ArrowLeft className="size-4" aria-hidden /> Back
          </button>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Your financial information is used to build your plan. We don't need to know your
            identity.
          </p>
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px"
          >
            {isLast ? "Build my plan" : "Continue"}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
