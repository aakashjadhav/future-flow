import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import { formatCompactINR, formatINR } from "@/lib/format";

interface Props {
  value: number;
  format?: "inr" | "compact" | "plain" | "percent";
  className?: string;
  duration?: number;
  suffix?: string;
}

function render(value: number, format: Props["format"]): string {
  switch (format) {
    case "compact":
      return formatCompactINR(value);
    case "plain":
      return Math.round(value).toLocaleString("en-IN");
    case "percent":
      return `${value.toFixed(0)}%`;
    default:
      return formatINR(value);
  }
}

/** Smoothly counts to a new figure; instant when reduced motion is requested. */
export function AnimatedNumber({ value, format = "inr", className, duration = 0.8, suffix }: Props) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const controls = animate(display, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduced]);

  return (
    <span className={className}>
      {render(display, format)}
      {suffix}
    </span>
  );
}
