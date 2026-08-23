import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { usePlanStore } from "@/store/planStore";
import { HeroFlowVisual } from "@/features/landing/HeroFlowVisual";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Continue with email — Alloq" },
      {
        name: "description",
        content: "Start your financial plan with just an email address. No phone number, no ID.",
      },
      { property: "og:title", content: "Continue with email — Alloq" },
      {
        property: "og:description",
        content: "Start your financial plan with just an email address.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const startFresh = usePlanStore((s) => s.startFresh);
  const loadSample = usePlanStore((s) => s.loadSample);
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setError("Please enter an email address we can send your code to.");
      return;
    }
    setError(null);
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    setStage("code");
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    startFresh(email);
    navigate({ to: "/onboarding" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <Link to="/" className="text-sm text-ink-soft hover:text-foreground">
          Back to home
        </Link>
      </header>

      <main className="mx-auto grid max-w-6xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold sm:text-4xl">Let's build your plan.</h1>
          <p className="mt-3 text-ink-soft">
            Your financial information is used to build your plan. We don't need to know your
            identity to help you plan — an email address is enough.
          </p>

          <AnimatePresence mode="wait">
            {stage === "email" ? (
              <motion.form
                key="email"
                onSubmit={submitEmail}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="panel mt-8 p-5"
                noValidate
              >
                <label htmlFor="email" className="text-xs font-medium text-ink-soft">
                  Email address
                </label>
                <div className="mt-1.5 flex items-center rounded-lg border border-input bg-card focus-within:border-accent">
                  <Mail className="ml-3 size-4 text-muted-foreground" aria-hidden />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "email-error" : undefined}
                    className="w-full bg-transparent px-3 py-2.5 text-base outline-none"
                  />
                </div>
                {error ? (
                  <p id="email-error" className="mt-2 text-xs text-critical">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px disabled:opacity-60"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  Continue
                </button>
                <p className="mt-3 text-xs text-muted-foreground">
                  We'll send a one-time code. No password, no phone number.
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="code"
                onSubmit={submitCode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="panel mt-8 p-5"
              >
                <p className="text-sm text-ink-soft">
                  Enter the 6-digit code we sent to <span className="font-medium">{email}</span>.
                </p>
                <label htmlFor="code" className="mt-4 block text-xs font-medium text-ink-soft">
                  One-time code
                </label>
                <input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder="••••••"
                  className="num mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-center text-2xl tracking-[0.4em] outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  Start onboarding
                  <ArrowRight className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setStage("email")}
                  className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  Use a different email
                </button>
                <p className="mt-3 text-xs text-muted-foreground">
                  Prototype flow — any code continues.
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => {
              loadSample();
              navigate({ to: "/dashboard" });
            }}
            className="mt-5 text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            Or explore the sample plan first →
          </button>
        </div>

        <div className="hidden lg:block">
          <HeroFlowVisual />
        </div>
      </main>
    </div>
  );
}
