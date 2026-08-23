import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { cn } from "@/lib/utils";

export interface FlowStep {
  label: string;
  amount: number;
  tone?: "neutral" | "out" | "available";
  note?: string;
}

export interface FlowBranch {
  label: string;
  amount: number;
  color: string;
}

const toneText = {
  neutral: "text-foreground",
  out: "text-ink-soft",
  available: "text-accent",
} as const;

/**
 * "Your Money Flow" — the signature visualization: income cascading through
 * commitments into available money, then branching into goal allocations.
 */
export function MoneyFlow({
  steps,
  branches,
  compactBranches = false,
  className,
}: {
  steps: FlowStep[];
  branches?: FlowBranch[];
  compactBranches?: boolean;
  className?: string;
}) {
  const branchTotal = branches?.reduce((a, b) => a + b.amount, 0) ?? 0;

  return (
    <div className={cn("w-full", className)}>
      <ol className="relative space-y-0">
        {steps.map((step, i) => (
          <motion.li
            key={step.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div
              className={cn(
                "flex items-baseline justify-between gap-4 rounded-lg px-4 py-3",
                step.tone === "available" && "bg-accent-soft",
              )}
            >
              <div>
                <p className="label-caps">{step.label}</p>
                {step.note ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{step.note}</p>
                ) : null}
              </div>
              <AnimatedNumber
                value={step.amount}
                className={cn(
                  "figure-md text-xl sm:text-2xl",
                  toneText[step.tone ?? "neutral"],
                  step.tone === "out" && "before:content-['−'] before:mr-1 before:opacity-50",
                )}
              />
            </div>
            {i < steps.length - 1 ? (
              <div className="ml-6 h-5 w-px bg-border" aria-hidden>
                <svg className="h-5 w-px overflow-visible">
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="20"
                    className="flow-dash stroke-accent/60"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            ) : null}
          </motion.li>
        ))}
      </ol>

      {branches?.length ? (
        <div className="mt-4">
          <div className="ml-6 h-4 w-px bg-border" aria-hidden />
          <div
            className={cn(
              "grid gap-2",
              compactBranches ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3",
            )}
          >
            {branches.map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.45 }}
                className="panel-quiet px-3 py-2.5"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: b.color }}
                    aria-hidden
                  />
                  <p className="truncate text-xs font-medium text-ink-soft">{b.label}</p>
                </div>
                <AnimatedNumber value={b.amount} format="compact" className="figure-md mt-1 block text-lg" />
              </motion.div>
            ))}
          </div>
          <p className="mt-3 px-1 text-xs text-muted-foreground">
            Allocated across goals: <span className="num font-medium">₹{branchTotal.toLocaleString("en-IN")}</span>{" "}
            per month
          </p>
        </div>
      ) : null}
    </div>
  );
}
