import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UIMessage } from "ai";

export interface CoachThread {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
}

const uid = () => Math.random().toString(36).slice(2, 10);

interface CoachState {
  threads: CoachThread[];
  createThread: () => CoachThread;
  ensureThread: (id: string) => void;
  setMessages: (id: string, messages: UIMessage[]) => void;
  renameThread: (id: string, title: string) => void;
  deleteThread: (id: string) => void;
}

export const newThreadId = uid;

export const useCoachStore = create<CoachState>()(
  persist(
    (set) => ({
      threads: [],

      createThread: () => {
        const thread: CoachThread = {
          id: uid(),
          title: "New conversation",
          updatedAt: Date.now(),
          messages: [],
        };
        set((s) => ({ threads: [thread, ...s.threads] }));
        return thread;
      },

      ensureThread: (id) =>
        set((s) =>
          s.threads.some((t) => t.id === id)
            ? s
            : {
                threads: [
                  { id, title: "New conversation", updatedAt: Date.now(), messages: [] },
                  ...s.threads,
                ],
              },
        ),

      setMessages: (id, messages) =>
        set((s) => {
          const first = messages.find((m) => m.role === "user");
          const derived = first
            ? first.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join(" ")
                .trim()
                .slice(0, 60)
            : "";
          return {
            threads: s.threads.map((t) =>
              t.id === id
                ? {
                    ...t,
                    messages,
                    updatedAt: Date.now(),
                    title:
                      t.title === "New conversation" && derived
                        ? derived || "New conversation"
                        : t.title,
                  }
                : t,
            ),
          };
        }),

      renameThread: (id, title) =>
        set((s) => ({
          threads: s.threads.map((t) => (t.id === id ? { ...t, title } : t)),
        })),

      deleteThread: (id) =>
        set((s) => ({ threads: s.threads.filter((t) => t.id !== id) })),
    }),
    { name: "alloq-coach-threads-v1", skipHydration: true },
  ),
);

/** Rehydrates persisted coach threads after mount so SSR markup matches. */
export function useCoachHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    void useCoachStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}
