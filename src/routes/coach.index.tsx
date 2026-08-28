import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoachHydrated, useCoachStore } from "@/store/coachStore";

export const Route = createFileRoute("/coach/")({
  head: () => ({
    meta: [
      { title: "Coach — Alloq" },
      {
        name: "description",
        content:
          "Chat with a financial coach that answers from your own cashflow, goals and allocation — streaming, with the maths shown.",
      },
      { property: "og:title", content: "Coach — Alloq" },
      {
        property: "og:description",
        content: "Streaming answers grounded in your cashflow, goals and allocation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoachIndexPage,
});

function CoachIndexPage() {
  const hydrated = useCoachHydrated();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    const state = useCoachStore.getState();
    const existing = [...state.threads].sort((a, b) => b.updatedAt - a.updatedAt)[0];
    const target = existing ?? state.createThread();
    void navigate({ to: "/coach/$threadId", params: { threadId: target.id }, replace: true });
  }, [hydrated, navigate]);

  return (
    <AppShell title="Ask about your plan">
      <div className="mx-auto max-w-3xl space-y-3">
        <Skeleton className="h-6 w-2/5" />
        <Skeleton className="h-24 w-full" />
      </div>
    </AppShell>
  );
}
