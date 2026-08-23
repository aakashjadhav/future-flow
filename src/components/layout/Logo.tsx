import { Link } from "@tanstack/react-router";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5" aria-label="Alloq home">
      <span className="relative grid size-8 place-items-center rounded-md bg-foreground">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <path d="M5 5v9a5 5 0 0 0 5 5h9" fill="none" stroke="var(--paper)" strokeWidth="2" />
          <circle cx="19" cy="19" r="2.6" fill="var(--accent)" />
        </svg>
      </span>
      <span className="font-display text-[1.0625rem] font-extrabold tracking-tight">Alloq</span>
    </Link>
  );
}
