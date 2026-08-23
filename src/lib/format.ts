/** Indian-numbering money + date formatting helpers. */

export function formatINR(value: number, opts?: { decimals?: boolean }): string {
  const n = Math.round(opts?.decimals ? value * 100 : value) / (opts?.decimals ? 100 : 1);
  return `₹${n.toLocaleString("en-IN", {
    maximumFractionDigits: opts?.decimals ? 2 : 0,
  })}`;
}

/** Compact Indian shorthand: ₹1.4 Cr, ₹15 L, ₹80 K */
export function formatCompactINR(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_00_00_000) return `₹${trim(value / 1_00_00_000)} Cr`;
  if (abs >= 1_00_000) return `₹${trim(value / 1_00_000)} L`;
  if (abs >= 1_000) return `₹${trim(value / 1_000)} K`;
  return formatINR(value);
}

function trim(n: number): string {
  return (Math.round(n * 10) / 10).toLocaleString("en-IN");
}

export function formatPerMonth(value: number): string {
  return `${formatINR(value)}/month`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "2029-06" -> "June 2029" */
export function formatMonthYear(value: string): string {
  const [y, m] = value.split("-");
  const idx = Number(m) - 1;
  if (!y || Number.isNaN(idx) || !MONTHS[idx]) return value;
  return `${MONTHS[idx]} ${y}`;
}

export function monthsBetween(from: Date, targetMonth: string): number {
  const [y, m] = targetMonth.split("-").map(Number);
  if (!y || !m) return 0;
  return Math.max(0, (y - from.getFullYear()) * 12 + (m - 1 - from.getMonth()));
}

export function addMonths(from: Date, months: number): string {
  const d = new Date(from.getFullYear(), from.getMonth() + Math.round(months), 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
