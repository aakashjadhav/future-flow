import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUp, MessageSquare } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { coachApi, type CoachReply } from "@/services/financialApi";
import { useHydrated } from "@/hooks/useHydrated";
import { usePlan } from "@/hooks/usePlan";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Coach — Alloq" },
      {
        name: "description",
        content:
          "Ask questions about your own plan and get answers backed by the actual numbers, calculations and assumptions.",
      },
      { property: "og:title", content: "Coach — Alloq" },
      {
        property: "og:description",
        content: "Answers grounded in your cashflow, goals and allocation — with the maths shown.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoachPage,
});

const SUGGESTIONS = [
  "Can I afford the car sooner?",
  "How much can I invest each month?",
  "What happens to retirement if I pause investing?",
  "Which goal is most at risk?",
];

interface Turn {
  id: string;
  question: string;
  reply?: CoachReply;
}

function CoachPage() {
  const hydrated = useHydrated();
  const { profile } = usePlan();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || pending) return;
    const id = Math.random().toString(36).slice(2, 9);
    setTurns((t) => [...t, { id, question: q }]);
    setValue("");
    setPending(true);
    try {
      const reply = await coachApi.ask(q, profile);
      setTurns((t) => t.map((turn) => (turn.id === id ? { ...turn, reply } : turn)));
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  return (
    <AppShell
      title="Ask about your plan"
      subtitle="Every answer is built from the numbers in your profile. The calculation and the assumptions behind it are always shown."
    >
      <div className="mx-auto max-w-2xl space-y-5">
        {turns.length === 0 ? (
          <div className="panel p-6 text-center">
            <MessageSquare className="mx-auto size-6 text-accent" aria-hidden />
            <p className="mt-3 text-sm text-muted-foreground">
              Start with one of these, or ask anything in your own words.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void ask(s)}
                  disabled={!hydrated}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {turns.map((turn) => (
          <div key={turn.id} className="space-y-3">
            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-foreground px-4 py-2.5 text-sm text-primary-foreground">
                {turn.question}
              </p>
            </div>
            {turn.reply ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="panel p-5"
              >
                <p className="text-sm leading-relaxed">{turn.reply.answer}</p>
                {turn.reply.calculation ? (
                  <dl className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border">
                    {turn.reply.calculation.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-4 px-3.5 py-2.5"
                      >
                        <dt className="text-xs text-muted-foreground">{row.label}</dt>
                        <dd className="figure-md text-sm capitalize">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {turn.reply.impact ? (
                  <p className="mt-4 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-accent">
                    {turn.reply.impact}
                  </p>
                ) : null}
                {turn.reply.assumptions ? (
                  <p className="mt-3 text-xs text-muted-foreground">{turn.reply.assumptions}</p>
                ) : null}
              </motion.div>
            ) : (
              <div className="panel space-y-3 p-5">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-16 w-full" />
              </div>
            )}
          </div>
        ))}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void ask(value);
          }}
          className="sticky bottom-20 lg:bottom-4"
        >
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2 shadow-sm">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ask about a goal, your surplus, or a what-if"
              aria-label="Your question"
              className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={pending || value.trim() === ""}
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-lg bg-foreground text-primary-foreground transition-opacity",
                (pending || value.trim() === "") && "opacity-40",
              )}
              aria-label="Send question"
            >
              <ArrowUp className="size-4" aria-hidden />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Educational guidance, not regulated financial advice.
          </p>
        </form>
      </div>
    </AppShell>
  );
}
