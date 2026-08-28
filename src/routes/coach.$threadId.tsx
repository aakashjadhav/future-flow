import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachChat } from "@/features/coach/CoachChat";
import { useCoachHydrated, useCoachStore } from "@/store/coachStore";

export const Route = createFileRoute("/coach/$threadId")({
  head: () => ({
    meta: [
      { title: "Coach conversation — Alloq" },
      {
        name: "description",
        content:
          "A saved coach conversation: streaming answers grounded in your cashflow, goals and monthly allocation.",
      },
      { property: "og:title", content: "Coach conversation — Alloq" },
      {
        property: "og:description",
        content: "Pick up where you left off with answers built from your own numbers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoachThreadPage,
});

function CoachThreadPage() {
  const { threadId } = Route.useParams();
  const hydrated = useCoachHydrated();
  const ensureThread = useCoachStore((s) => s.ensureThread);

  useEffect(() => {
    if (hydrated) ensureThread(threadId);
  }, [hydrated, threadId, ensureThread]);

  return (
    <AppShell
      title="Ask about your plan"
      subtitle="Answers stream in live and are built from the numbers in your profile — the calculation and assumptions are always shown."
    >
      {hydrated ? (
        <CoachChat key={threadId} threadId={threadId} />
      ) : (
        <div className="mx-auto max-w-3xl space-y-3">
          <Skeleton className="h-6 w-2/5" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}
    </AppShell>
  );
}
