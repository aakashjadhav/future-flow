import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AssetItem,
  CreditCardProfile,
  ExpenseItem,
  FinancialProfile,
  Goal,
  IncomeSource,
  Loan,
  RiskProfile,
} from "@/types/finance";
import { emptyProfile, sampleProfile } from "@/services/mockData";

const uid = () => Math.random().toString(36).slice(2, 9);

interface PlanState {
  profile: FinancialProfile;
  onboardingComplete: boolean;
  setEmail: (email: string) => void;
  loadSample: () => void;
  startFresh: (email: string) => void;
  addIncome: () => void;
  updateIncome: (id: string, patch: Partial<IncomeSource>) => void;
  removeIncome: (id: string) => void;
  addExpense: (category?: string) => void;
  updateExpense: (id: string, patch: Partial<ExpenseItem>) => void;
  removeExpense: (id: string) => void;
  addLoan: () => void;
  updateLoan: (id: string, patch: Partial<Loan>) => void;
  removeLoan: (id: string) => void;
  updateCard: (patch: Partial<CreditCardProfile>) => void;
  addAsset: () => void;
  updateAsset: (id: string, patch: Partial<AssetItem>) => void;
  removeAsset: (id: string) => void;
  setEmergencySavings: (value: number) => void;
  addGoal: (goal: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  setRisk: (risk: RiskProfile) => void;
  setPremium: (premium: boolean) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      profile: sampleProfile,
      onboardingComplete: true,

      setEmail: (email) => set((s) => ({ profile: { ...s.profile, email } })),

      loadSample: () => set({ profile: { ...sampleProfile }, onboardingComplete: true }),

      startFresh: (email) =>
        set({
          profile: { ...structuredClone(emptyProfile), email },
          onboardingComplete: false,
        }),

      addIncome: () =>
        set((s) => ({
          profile: {
            ...s.profile,
            incomes: [...s.profile.incomes, { id: uid(), label: "Other income", amount: 0 }],
          },
        })),
      updateIncome: (id, patch) =>
        set((s) => ({
          profile: {
            ...s.profile,
            incomes: s.profile.incomes.map((i) => (i.id === id ? { ...i, ...patch } : i)),
          },
        })),
      removeIncome: (id) =>
        set((s) => ({
          profile: { ...s.profile, incomes: s.profile.incomes.filter((i) => i.id !== id) },
        })),

      addExpense: (category = "Other") =>
        set((s) => ({
          profile: {
            ...s.profile,
            expenses: [
              ...s.profile.expenses,
              { id: uid(), category, amount: 0, kind: "discretionary" },
            ],
          },
        })),
      updateExpense: (id, patch) =>
        set((s) => ({
          profile: {
            ...s.profile,
            expenses: s.profile.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          },
        })),
      removeExpense: (id) =>
        set((s) => ({
          profile: { ...s.profile, expenses: s.profile.expenses.filter((e) => e.id !== id) },
        })),

      addLoan: () =>
        set((s) => ({
          profile: {
            ...s.profile,
            loans: [
              ...s.profile.loans,
              {
                id: uid(),
                name: "New loan",
                type: "personal",
                outstanding: 0,
                emi: 0,
                interestRate: 10,
                remainingMonths: 24,
              },
            ],
          },
        })),
      updateLoan: (id, patch) =>
        set((s) => ({
          profile: {
            ...s.profile,
            loans: s.profile.loans.map((l) => (l.id === id ? { ...l, ...patch } : l)),
          },
        })),
      removeLoan: (id) =>
        set((s) => ({
          profile: { ...s.profile, loans: s.profile.loans.filter((l) => l.id !== id) },
        })),

      updateCard: (patch) =>
        set((s) => ({ profile: { ...s.profile, creditCard: { ...s.profile.creditCard, ...patch } } })),

      addAsset: () =>
        set((s) => ({
          profile: {
            ...s.profile,
            assets: [
              ...s.profile.assets,
              { id: uid(), name: "New holding", type: "savings", value: 0 },
            ],
          },
        })),
      updateAsset: (id, patch) =>
        set((s) => ({
          profile: {
            ...s.profile,
            assets: s.profile.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)),
          },
        })),
      removeAsset: (id) =>
        set((s) => ({
          profile: { ...s.profile, assets: s.profile.assets.filter((a) => a.id !== id) },
        })),

      setEmergencySavings: (value) =>
        set((s) => ({ profile: { ...s.profile, emergencySavings: value } })),

      addGoal: (goal) =>
        set((s) => ({
          profile: { ...s.profile, goals: [...s.profile.goals, { ...goal, id: uid() }] },
        })),
      updateGoal: (id, patch) =>
        set((s) => ({
          profile: {
            ...s.profile,
            goals: s.profile.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
          },
        })),
      removeGoal: (id) =>
        set((s) => ({
          profile: { ...s.profile, goals: s.profile.goals.filter((g) => g.id !== id) },
        })),

      setRisk: (risk) => set((s) => ({ profile: { ...s.profile, risk } })),
      setPremium: (premium) => set((s) => ({ profile: { ...s.profile, premium } })),
      completeOnboarding: () =>
        set((s) => ({ onboardingComplete: true, profile: { ...s.profile, isSample: false } })),
      reset: () => set({ profile: { ...sampleProfile }, onboardingComplete: true }),
    }),
    { name: "alloq-plan-v1", skipHydration: true },
  ),
);
