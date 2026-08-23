import { useId } from "react";
import { cn } from "@/lib/utils";

/** Number field with a rupee affix; emits plain numbers, never strings. */
export function MoneyInput({
  label,
  value,
  onChange,
  placeholder = "0",
  suffix,
  className,
  prefix = "₹",
  max,
  step = 500,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  suffix?: string;
  className?: string;
  prefix?: string;
  max?: number;
  step?: number;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs font-medium text-ink-soft">
        {label}
      </label>
      <div className="mt-1.5 flex items-center rounded-lg border border-input bg-card transition-colors focus-within:border-accent">
        <span className="pl-3 text-sm text-muted-foreground">{prefix}</span>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          max={max}
          step={step}
          value={Number.isFinite(value) ? String(value) : ""}
          placeholder={placeholder}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className={cn(
            "num w-full bg-transparent px-2 py-2.5 text-base font-semibold outline-none",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
          )}
        />
        {suffix ? <span className="pr-3 text-xs text-muted-foreground">{suffix}</span> : null}
      </div>
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  className,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs font-medium text-ink-soft">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-base outline-none transition-colors focus-within:border-accent focus:border-accent"
      />
    </div>
  );
}
