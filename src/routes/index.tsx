import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { HeroFlowVisual } from "@/features/landing/HeroFlowVisual";
import { ScenarioPreview } from "@/features/landing/ScenarioPreview";
import { AllocationBar } from "@/components/finance/AllocationBar";
import { StatusPill } from "@/components/finance/StatusPill";
import { buildMonthlyPlan } from "@/services/planEngine";
import { investmentInstruments, sampleProfile } from "@/services/mockData";
import { formatCompactINR, formatINR } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alloq — Turn your income into a plan for your future" },
      {
        name: "description",
        content:
          "Understand your monthly financial capacity, define your goals, and get a personalised monthly allocation across the things that matter most.",
      },
      { property: "og:title", content: "Alloq — Goal-based monthly money allocation" },
      {
        property: "og:description",
        content:
          "See exactly how much of your monthly income should go toward each of your financial goals.",
      },
    ],
  }),
  component: Landing,
});

const samplePlan = buildMonthlyPlan(sampleProfile);

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-ink-soft md:flex" aria-label="Main">
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#plan" className="hover:text-foreground">
              Example plan
            </a>
            <a href="#scenarios" className="hover:text-foreground">
              Scenarios
            </a>
            <a href="#privacy" className="hover:text-foreground">
              Privacy
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-secondary hover:text-foreground sm:block"
            >
              View sample plan
            </Link>
            <Link
              to="/auth"
              className="rounded-md bg-foreground px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-ink-soft"
            >
              <span className="size-1.5 rounded-full bg-accent" aria-hidden />
              Goal-based planning · Email only, no identity documents
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="mt-6 text-4xl leading-[1.05] font-extrabold sm:text-5xl lg:text-[3.4rem]"
            >
              Turn your income into a plan for your future.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="mt-5 text-lg text-ink-soft"
            >
              Understand your money, define your goals, and discover how to allocate your monthly
              income across the things that matter most.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px"
              >
                Build My Financial Plan
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                See How It Works
              </a>
            </motion.div>

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6">
              {[
                ["Income mapped", "in minutes"],
                ["Goals modelled", "individually"],
                ["Allocation", "month by month"],
              ].map(([a, b]) => (
                <div key={a}>
                  <dt className="text-sm font-semibold">{a}</dt>
                  <dd className="text-xs text-muted-foreground">{b}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroFlowVisual />
        </div>
      </section>

      {/* HOW IT WORKS — timeline */}
      <section id="how" className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold">
            One guided pass through your financial reality — then the plan writes itself.
          </h2>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                t: "Enter what comes in",
                d: "Salary, freelance, anything recurring. Totals update as you type.",
              },
              {
                n: "02",
                t: "Enter what goes out",
                d: "Essentials, discretionary spending, EMIs and card behaviour.",
              },
              {
                n: "03",
                t: "Describe your goals",
                d: "Amount, date, what you've already saved, how flexible each one is.",
              },
              {
                n: "04",
                t: "Get your allocation",
                d: "A monthly split across goals, with an honest status for each.",
              },
            ].map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.45 }}
                className="bg-card p-6"
              >
                <p className="figure-md text-sm text-accent">{s.n}</p>
                <h3 className="mt-3 text-base font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionLabel>The planning journey</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold">
              Every step exists to answer one question about your money.
            </h2>
            <p className="mt-4 text-ink-soft">
              Nothing here is a form for the sake of a form. Each screen adds one input the
              allocation engine genuinely needs.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              ["Income", "What can be planned with"],
              ["Expenses", "What is already promised"],
              ["Loans & EMIs", "What debt costs each month"],
              ["Credit cards", "Convenience vs revolving debt"],
              ["Assets", "What is already working for you"],
              ["Emergency fund", "How much runway you hold"],
              ["Goals", "What you're actually planning for"],
              ["Risk profile", "Which return assumption fits you"],
            ].map(([t, d], i) => (
              <motion.li
                key={t}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="panel-quiet px-4 py-3"
              >
                <p className="text-sm font-semibold">{t}</p>
                <p className="text-xs text-muted-foreground">{d}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* EXAMPLE PLAN */}
      <section id="plan" className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionLabel>An example monthly plan</SectionLabel>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold">
            This is the answer the product is built to give you.
          </h2>
          <div className="panel mt-9 p-5 sm:p-7">
            <AllocationBar allocations={samplePlan.allocations} available={samplePlan.available} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Sample data: ₹2,00,000 income, ₹1,20,000 of commitments, four goals.
          </p>
        </div>
      </section>

      {/* GOAL STRATEGY */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionLabel>Goal-based strategy</SectionLabel>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold">
          Each goal gets its own maths — and an honest status.
        </h2>
        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {[
            {
              status: "on-track" as const,
              title: "Retirement · 2050",
              body: "Long horizon, flexible timing. Receives the largest share because time does most of the work.",
              figure: formatINR(30000),
            },
            {
              status: "at-risk" as const,
              title: "Car · June 2029",
              body: "Shorter horizon means the monthly requirement is high relative to what's available.",
              figure: formatINR(20000),
            },
            {
              status: "not-feasible" as const,
              title: "Education · 2040 (fixed)",
              body: "If a fixed date can't be funded, the plan says so instead of quietly under-funding it.",
              figure: formatINR(15000),
            },
          ].map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              className="panel p-5"
            >
              <StatusPill status={c.status} />
              <h3 className="mt-4 text-base font-semibold">{c.title}</h3>
              <p className="figure-xl mt-2 text-2xl">{c.figure}</p>
              <p className="mt-3 text-sm text-muted-foreground">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SCENARIOS */}
      <section id="scenarios" className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <SectionLabel>Scenario simulator</SectionLabel>
              <h2 className="mt-3 text-3xl font-bold">Change one input. Watch the plan respond.</h2>
              <p className="mt-4 text-ink-soft">
                Move the monthly amount, shift the date, add an annual step-up — projections update
                live so you can see the trade-off before you commit to it.
              </p>
            </div>
            <ScenarioPreview />
          </div>
        </div>
      </section>

      {/* INVESTMENT INTELLIGENCE */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionLabel>Investment intelligence</SectionLabel>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold">
          Once you know the amount, explore where it could go.
        </h2>
        <div className="mt-9 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Instrument</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 text-right font-semibold">3Y</th>
                <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">5Y</th>
                <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">Expense</th>
              </tr>
            </thead>
            <tbody>
              {investmentInstruments.slice(0, 4).map((f) => (
                <tr key={f.id} className="border-t border-border bg-card">
                  <td className="px-4 py-3 font-medium">{f.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.subCategory}</td>
                  <td className="num px-4 py-3 text-right">{f.return3y}%</td>
                  <td className="num hidden px-4 py-3 text-right sm:table-cell">{f.return5y}%</td>
                  <td className="num hidden px-4 py-3 text-right sm:table-cell">{f.expenseRatio}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Placeholder research data. Past performance is not indicative of future results.
        </p>
      </section>

      {/* PRIVACY */}
      <section id="privacy" className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2">
          <div>
            <SectionLabel>Privacy philosophy</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold">
              Your financial information is used to build your plan. We don't need to know your
              identity to help you plan.
            </h2>
            <p className="mt-4 text-ink-soft">
              Planning needs numbers, not documents. So we ask for an email address and nothing else
              that identifies you.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="panel-quiet p-5">
              <ShieldCheck className="size-5 text-positive" aria-hidden />
              <p className="mt-3 text-sm font-semibold">What we ask for</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Email address</li>
                <li>Income, expenses, EMIs</li>
                <li>Goals and existing savings</li>
              </ul>
            </div>
            <div className="panel-quiet p-5">
              <Lock className="size-5 text-ink-soft" aria-hidden />
              <p className="mt-3 text-sm font-semibold">What we never ask for</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>PAN, Aadhaar, address</li>
                <li>Phone number, employer</li>
                <li>Bank or card numbers</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM TEASER */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="panel grid gap-8 p-6 sm:p-9 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
              <Sparkles className="size-3" aria-hidden /> Premium
            </span>
            <h2 className="mt-4 text-2xl font-bold">Unlock deeper planning</h2>
            <p className="mt-3 text-sm text-ink-soft">
              The free plan gives you a complete monthly allocation and honest goal statuses.
              Premium adds optimisation across every goal, richer research and continuous
              monitoring.
            </p>
            <Link
              to="/premium"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Compare free and premium <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="grid gap-2 self-center sm:grid-cols-2">
            {[
              "Multi-goal optimisation",
              "Unlimited goals",
              "Advanced scenarios",
              "AI financial coach",
              "Deep investment research",
              "Goal alerts & monitoring",
            ].map((f) => (
              <li key={f} className="rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium">
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">
            You already earn the money. Give it a destination.
          </h2>
          <p className="mt-4 text-sm opacity-80">
            {formatCompactINR(samplePlan.available)} available in the sample profile — allocated
            across four goals in under ten minutes.
          </p>
          <Link
            to="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-px"
          >
            Build My Financial Plan <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
          <Logo />
          <p className="max-w-lg text-xs text-muted-foreground">
            Alloq helps you plan. Projected values are estimates based on the assumptions shown and
            are not guaranteed returns. Nothing here is investment advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 label-caps">
      <span className="h-px w-6 bg-accent" aria-hidden />
      {children}
    </p>
  );
}
