import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  BarChart3,
  Compass,
  LayoutGrid,
  MessageSquare,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { usePlanStore } from "@/store/planStore";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid },
  { to: "/plan", label: "My Plan", icon: Wallet },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/investments", label: "Investments", icon: Compass },
  { to: "/scenarios", label: "Scenarios", icon: BarChart3 },
  { to: "/coach", label: "Coach", icon: MessageSquare },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
  action,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const hydrated = useHydrated();
  const premium = usePlanStore((s) => s.profile.premium);
  const isSample = usePlanStore((s) => s.profile.isSample);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Logo to="/dashboard" />
          <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {hydrated && premium ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
                <Sparkles className="size-3" aria-hidden /> Premium
              </span>
            ) : (
              <Link
                to="/premium"
                className="rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Unlock deeper planning
              </Link>
            )}
            <Link
              to="/profile"
              className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-semibold"
              aria-label="Profile"
            >
              You
            </Link>
          </div>
        </div>
      </header>

      {hydrated && isSample ? (
        <div className="border-b border-border bg-warning-soft/60">
          <p className="mx-auto max-w-6xl px-4 py-2 text-xs text-ink-soft sm:px-6">
            You're viewing a <span className="font-semibold">sample financial profile</span>.{" "}
            <Link to="/auth" className="font-medium text-accent underline-offset-4 hover:underline">
              Build your own plan
            </Link>{" "}
            to replace it.
          </p>
        </div>
      ) : null}

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10"
      >
        {title ? (
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
              {subtitle ? (
                <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            {action}
          </div>
        ) : null}
        {children}
      </motion.main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
        aria-label="Main mobile"
      >
        <ul className="flex">
          {NAV.map((item) => (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-muted-foreground",
                )}
                activeProps={{ className: "text-accent" }}
              >
                <item.icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
