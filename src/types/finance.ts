export type ExpenseKind = "essential" | "discretionary";

export type LoanType = "home" | "car" | "personal" | "education" | "other";

export type AssetType =
  | "savings"
  | "fd"
  | "mutual-fund"
  | "stocks"
  | "epf"
  | "ppf"
  | "nps"
  | "gold"
  | "other";

export type GoalCategory =
  | "car"
  | "home"
  | "education"
  | "travel"
  | "wedding"
  | "retirement"
  | "business"
  | "emergency"
  | "other";

export type RiskProfile = "conservative" | "moderate" | "growth" | "aggressive";

export type GoalStatus = "on-track" | "at-risk" | "not-feasible";

export interface IncomeSource {
  id: string;
  label: string;
  amount: number;
}

export interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  kind: ExpenseKind;
}

export interface Loan {
  id: string;
  name: string;
  type: LoanType;
  outstanding: number;
  emi: number;
  interestRate: number;
  remainingMonths: number;
}

export interface CreditCardProfile {
  outstanding: number;
  averageBill: number;
  minimumDue: number;
  typicalPayment: number;
  revolves: boolean;
}

export interface AssetItem {
  id: string;
  name: string;
  type: AssetType;
  value: number;
  goalId?: string | undefined;
}

export interface Goal {
  id: string;
  name: string;
  category: GoalCategory;
  targetAmount: number;
  targetDate: string; // YYYY-MM
  savedAmount: number;
  priority: 1 | 2 | 3; // 1 = highest
  flexibility: "fixed" | "flexible";
}

export interface FinancialProfile {
  email: string;
  isSample: boolean;
  incomes: IncomeSource[];
  expenses: ExpenseItem[];
  loans: Loan[];
  creditCard: CreditCardProfile;
  assets: AssetItem[];
  emergencySavings: number;
  goals: Goal[];
  risk: RiskProfile;
  premium: boolean;
}

export interface CashflowSummary {
  monthlyIncome: number;
  essentialExpenses: number;
  discretionaryExpenses: number;
  emiTotal: number;
  cardPayment: number;
  committed: number;
  surplus: number;
  assetsTotal: number;
  debtOutstanding: number;
  emergencyTarget: number;
  emergencyGap: number;
  emergencyProgress: number;
  healthScore: number;
  savingsRate: number;
}

export interface GoalProjection {
  goalId: string;
  monthsRemaining: number;
  futureValueOfSaved: number;
  amountStillNeeded: number;
  requiredMonthly: number;
  assumedReturn: number;
}

export interface Allocation {
  id: string;
  label: string;
  amount: number;
  kind: "emergency" | "goal" | "buffer";
  goalId?: string;
  requiredMonthly?: number;
  status?: GoalStatus;
  colorToken: string;
}

export interface MonthlyPlan {
  available: number;
  allocations: Allocation[];
  totalAllocated: number;
  totalRequired: number;
  fundingGap: number;
  projections: GoalProjection[];
}

export interface ScenarioInput {
  monthlyInvestment: number;
  targetDate: string;
  annualStepUp: number; // %
  targetAmount: number;
  expectedReturn: number; // %
}

export interface ScenarioResult {
  projectedCorpus: number;
  fundingGap: number;
  monthsToGoal: number;
  achievedByLabel: string;
  status: GoalStatus;
}
