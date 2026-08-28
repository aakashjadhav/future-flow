import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquarePlus, PanelLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useCoachStore, type CoachThread } from "@/store/coachStore";
import { usePlan } from "@/hooks/usePlan";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Can I afford the car sooner?",
  "How much can I invest each month?",
  "What happens to retirement if I pause investing?",
  "Which goal is most at risk?",
];

function textOf(parts: { type: string }[]): string {
  return parts
    .map((p) => (p.type === "text" ? ((p as { text?: string }).text ?? "") : ""))
    .join("");
}

export function CoachChat({ threadId }: { threadId: string }) {
  const navigate = useNavigate();
  const { profile } = usePlan();
  const threads = useCoachStore((s) => s.threads);
  const thread = threads.find((t) => t.id === threadId);
  const setMessages = useCoachStore((s) => s.setMessages);
  const createThread = useCoachStore((s) => s.createThread);
  const deleteThread = useCoachStore((s) => s.deleteThread);

  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const { messages, sendMessage, status, stop, error } = useChat({
    id: threadId,
    messages: thread?.messages ?? [],
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages: msgs, id }) => ({
        body: { messages: msgs, id, profile: profileRef.current },
      }),
    }),
    onError: (err) => toast.error(err.message || "The coach couldn't answer just now."),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (messages.length > 0) setMessages(threadId, messages);
  }, [messages, status, threadId, setMessages]);

  useEffect(() => {
    if (!busy) textareaRef.current?.focus();
  }, [busy, threadId]);

  function ask(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    void sendMessage({ text: q });
  }

  function startNew() {
    const next = createThread();
    setSidebarOpen(false);
    void navigate({ to: "/coach/$threadId", params: { threadId: next.id } });
  }

  function remove(id: string) {
    deleteThread(id);
    if (id === threadId) {
      const remaining = threads.filter((t) => t.id !== id);
      const first = remaining[0];
      if (first) void navigate({ to: "/coach/$threadId", params: { threadId: first.id } });
      else void navigate({ to: "/coach" });
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] gap-6">
      <ThreadList
        threads={threads}
        activeId={threadId}
        onNew={startNew}
        onDelete={remove}
        className="hidden w-60 shrink-0 lg:block"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-3 flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium"
          >
            <PanelLeft className="size-4" aria-hidden /> Conversations
          </button>
          <button
            type="button"
            onClick={startNew}
            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium"
          >
            <MessageSquarePlus className="size-4" aria-hidden /> New
          </button>
        </div>
        {sidebarOpen ? (
          <ThreadList
            threads={threads}
            activeId={threadId}
            onNew={startNew}
            onDelete={remove}
            className="mb-4 lg:hidden"
          />
        ) : null}

        {messages.length === 0 ? (
          <div className="panel p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Ask anything about your plan. Every answer is built from your own numbers, with the
              calculation shown.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <Conversation className="min-h-0 flex-1">
            <ConversationContent className="gap-5 px-0">
              {messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  {message.role === "user" ? (
                    <MessageContent className="bg-primary text-primary-foreground">
                      {textOf(message.parts)}
                    </MessageContent>
                  ) : (
                    <MessageContent className="bg-transparent p-0 text-foreground">
                      <MessageResponse>{textOf(message.parts)}</MessageResponse>
                    </MessageContent>
                  )}
                </Message>
              ))}
              {status === "submitted" ? (
                <Shimmer className="text-sm">Working through your numbers…</Shimmer>
              ) : null}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        )}

        {error ? (
          <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error.message}
          </p>
        ) : null}

        <div className="sticky bottom-20 mt-4 bg-background lg:bottom-4">
          <PromptInput
            onSubmit={(_, e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a goal, your surplus, or a what-if"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                status={status}
                disabled={!busy && input.trim() === ""}
                onStop={stop}
              />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Educational guidance, not regulated financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}

function ThreadList({
  threads,
  activeId,
  onNew,
  onDelete,
  className,
}: {
  threads: CoachThread[];
  activeId: string;
  onNew: () => void;
  onDelete: (id: string) => void;
  className?: string;
}) {
  return (
    <aside className={className} aria-label="Coach conversations">
      <button
        type="button"
        onClick={onNew}
        className="mb-3 inline-flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
      >
        <MessageSquarePlus className="size-4" aria-hidden /> New conversation
      </button>
      <ul className="space-y-1">
        {threads.map((t) => (
          <li
            key={t.id}
            className={cn(
              "group flex items-center gap-1 rounded-lg px-1 transition-colors hover:bg-secondary",
              t.id === activeId && "bg-secondary",
            )}
          >
            <Link
              to="/coach/$threadId"
              params={{ threadId: t.id }}
              className="min-w-0 flex-1 truncate py-2 pl-2 text-sm"
            >
              {t.title}
            </Link>
            <button
              type="button"
              onClick={() => onDelete(t.id)}
              aria-label={`Delete ${t.title}`}
              className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
