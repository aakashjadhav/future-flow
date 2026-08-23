import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  format = "inr",
  note,
  tone = "neutral",
  index = 0,
  suffix,
}: {
  label: string;
  value: number;
  format?: "inr" | "compact" | "plain" | "percent";
  note?: string;
  tone?: "neutral" | "accent" | "positive" | "warning" | "critical";
  index?: number;
  suffix?: string;
}) {
  const toneClass = {
    neutral: "text-foreground",
    accent: "text-accent",
    positive: "text-positive",
    warning: "text-warning",
    critical: "text-critical",
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="panel p-4 sm:p-5"
    >
      <p className="label-caps">{label}</p>
      <AnimatedNumber
        value={value}
        format={format}
        suffix={suffix}
        className={cn("figure-xl mt-2 block text-2xl sm:text-[1.75rem]", toneClass)}
      />
      {note ? <p className="mt-1.5 text-xs text-muted-foreground">{note}</p> : null}
    </motion.div>
  );
}
