import type { FinancialProfile } from "@/types/finance";

const id = () => Math.random().toString(36).slice(2, 9);

/** Demonstration profile — clearly labelled as sample data in the UI. */
export const sampleProfile: FinancialProfile = {
  email: "you@example.com",
  isSample: true,
  premium: false,
  incomes: [
    { id: id(), label: "Salary", amount: 180000 },
    { id: id(), label: "Freelance", amount: 20000 },
  ],
  expenses: [
    { id: id(), category: "Housing", amount: 28000, kind: "essential" },
    { id: id(), category: "Food", amount: 16000, kind: "essential" },
    { id: id(), category: "Transportation", amount: 6000, kind: "essential" },
    { id: id(), category: "Utilities", amount: 5000, kind: "essential" },
    { id: id(), category: "Healthcare", amount: 4000, kind: "essential" },
    { id: id(), category: "Insurance", amount: 6000, kind: "essential" },
    { id: id(), category: "Family", amount: 5000, kind: "essential" },
    { id: id(), category: "Travel", amount: 6000, kind: "discretionary" },
    { id: id(), category: "Entertainment", amount: 3000, kind: "discretionary" },
    { id: id(), category: "Subscriptions", amount: 1000, kind: "discretionary" },
  ],
  loans: [
    {
      id: id(),
      name: "Home loan",
      type: "home",
      outstanding: 4200000,
      emi: 32000,
      interestRate: 8.6,
      remainingMonths: 186,
    },
    {
      id: id(),
      name: "Car loan",
      type: "car",
      outstanding: 380000,
      emi: 8000,
      interestRate: 9.4,
      remainingMonths: 52,
    },
  ],
  creditCard: {
    outstanding: 42000,
    averageBill: 38000,
    minimumDue: 2100,
    typicalPayment: 38000,
    revolves: false,
  },
  assets: [
    { id: id(), name: "Savings account", type: "savings", value: 350000 },
    { id: id(), name: "Index funds", type: "mutual-fund", value: 820000 },
    { id: id(), name: "EPF", type: "epf", value: 640000 },
    { id: id(), name: "Gold", type: "gold", value: 180000 },
  ],
  emergencySavings: 350000,
  goals: [
    {
      id: "goal-car",
      name: "Car",
      category: "car",
      targetAmount: 1500000,
      targetDate: "2029-06",
      savedAmount: 200000,
      priority: 2,
      flexibility: "flexible",
    },
    {
      id: "goal-education",
      name: "Education",
      category: "education",
      targetAmount: 4000000,
      targetDate: "2040-04",
      savedAmount: 300000,
      priority: 1,
      flexibility: "fixed",
    },
    {
      id: "goal-retirement",
      name: "Retirement",
      category: "retirement",
      targetAmount: 25000000,
      targetDate: "2050-01",
      savedAmount: 640000,
      priority: 1,
      flexibility: "flexible",
    },
    {
      id: "goal-travel",
      name: "Travel",
      category: "travel",
      targetAmount: 300000,
      targetDate: "2028-12",
      savedAmount: 40000,
      priority: 3,
      flexibility: "flexible",
    },
  ],
  risk: "moderate",
};

export const emptyProfile: FinancialProfile = {
  email: "",
  isSample: false,
  premium: false,
  incomes: [{ id: id(), label: "Salary", amount: 0 }],
  expenses: [
    { id: id(), category: "Housing", amount: 0, kind: "essential" },
    { id: id(), category: "Food", amount: 0, kind: "essential" },
    { id: id(), category: "Transportation", amount: 0, kind: "essential" },
    { id: id(), category: "Utilities", amount: 0, kind: "essential" },
    { id: id(), category: "Entertainment", amount: 0, kind: "discretionary" },
    { id: id(), category: "Subscriptions", amount: 0, kind: "discretionary" },
  ],
  loans: [],
  creditCard: {
    outstanding: 0,
    averageBill: 0,
    minimumDue: 0,
    typicalPayment: 0,
    revolves: false,
  },
  assets: [],
  emergencySavings: 0,
  goals: [],
  risk: "moderate",
};

export interface InvestmentInstrument {
  id: string;
  name: string;
  category: "Mutual Funds" | "Equities" | "ETFs" | "Fixed Income" | "Other Instruments";
  subCategory: string;
  return3y: number;
  return5y: number;
  risk: "Low" | "Moderate" | "High";
  expenseRatio: number;
  aum: number;
  history: { year: string; value: number }[];
}

const series = (base: number, drift: number) =>
  ["2021", "2022", "2023", "2024", "2025", "2026"].map((year, i) => ({
    year,
    value: Math.round(base * Math.pow(1 + drift / 100, i) * (1 + (i % 2 === 0 ? 0.01 : -0.015))),
  }));

export const investmentInstruments: InvestmentInstrument[] = [
  {
    id: "mf-1",
    name: "Broad Market Index Fund",
    category: "Mutual Funds",
    subCategory: "Index · Large cap",
    return3y: 14.2,
    return5y: 15.8,
    risk: "Moderate",
    expenseRatio: 0.2,
    aum: 42800,
    history: series(100, 13),
  },
  {
    id: "mf-2",
    name: "Flexi Cap Growth Fund",
    category: "Mutual Funds",
    subCategory: "Flexi cap",
    return3y: 16.1,
    return5y: 17.4,
    risk: "High",
    expenseRatio: 0.78,
    aum: 18600,
    history: series(100, 15),
  },
  {
    id: "mf-3",
    name: "Short Duration Debt Fund",
    category: "Fixed Income",
    subCategory: "Debt · Short duration",
    return3y: 7.1,
    return5y: 6.6,
    risk: "Low",
    expenseRatio: 0.28,
    aum: 9400,
    history: series(100, 7),
  },
  {
    id: "etf-1",
    name: "Nifty Next 50 ETF",
    category: "ETFs",
    subCategory: "ETF · Mid cap tilt",
    return3y: 18.4,
    return5y: 16.2,
    risk: "High",
    expenseRatio: 0.15,
    aum: 6800,
    history: series(100, 16),
  },
  {
    id: "eq-1",
    name: "Diversified Blue Chip Basket",
    category: "Equities",
    subCategory: "Direct equity basket",
    return3y: 15.5,
    return5y: 14.1,
    risk: "High",
    expenseRatio: 0,
    aum: 0,
    history: series(100, 14),
  },
  {
    id: "fi-1",
    name: "Government Bond Ladder",
    category: "Fixed Income",
    subCategory: "Sovereign · 5–10Y",
    return3y: 7.6,
    return5y: 7.2,
    risk: "Low",
    expenseRatio: 0,
    aum: 0,
    history: series(100, 7.4),
  },
  {
    id: "ot-1",
    name: "Gold Accumulation",
    category: "Other Instruments",
    subCategory: "Commodity",
    return3y: 12.9,
    return5y: 11.4,
    risk: "Moderate",
    expenseRatio: 0.35,
    aum: 3100,
    history: series(100, 11),
  },
];
