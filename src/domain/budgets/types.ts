import type {
  BudgetLine,
  BudgetPlan,
  Category,
  FixedRecord,
  RecordType,
} from '@/src/interfaces/schema';

export type BudgetLineScope = 'category' | 'fixed';
export type BudgetLineSource =
  | 'manual'
  | 'template'
  | 'fixed'
  | 'previous_month'
  | 'actuals'
  | 'group_average'
  | 'savings';
export type BudgetApplyMode = 'merge' | 'replace' | 'reset';
export type BudgetPeriodRelation = 'past' | 'current' | 'future';
export type BudgetLineStatus =
  | 'on_track'
  | 'warning'
  | 'over'
  | 'unplanned'
  | 'fixed_pending';

export type BudgetLineComparison = {
  lineId: number;
  scope: BudgetLineScope;
  categoryId: number | null;
  categoryName: string;
  recordTypeId: number | null;
  typeName: string;
  effect: '+' | '-' | '=' | null;
  plannedCents: number;
  actualCents: number;
  pendingFixedCents: number;
  varianceCents: number;
  usagePercent: number;
  projectedCents: number | null;
  status: BudgetLineStatus;
  priority: number;
  notes: string | null;
  fixedId: number | null;
  fixedName: string | null;
  fixedDay: number | null;
  fixedConfirmed: boolean;
  sortOrder: number;
};

export type BudgetUnplannedBucket = {
  categoryId: number | null;
  categoryName: string;
  recordTypeId: number | null;
  typeName: string;
  effect: '+' | '-' | '=' | null;
  actualCents: number;
  recordCount: number;
};

export type BudgetFixedCommitment = {
  fixedId: number;
  name: string;
  day: number;
  amountCents: number;
  categoryId: number | null;
  categoryName: string;
  recordTypeId: number | null;
  typeName: string;
  confirmed: boolean;
  recordId: number | null;
  lineId: number | null;
  active: boolean;
  dueDate: number | null;
  inPeriod: boolean;
};

export type BudgetObligationKind =
  | 'financing'
  | 'vehicle'
  | 'savings'
  | 'card';

export type BudgetObligation = {
  key: string;
  kind: BudgetObligationKind;
  label: string;
  amountCents: number;
  date: number | null;
  /** Adds to the consumption expected expense because it is not in plan/actuals. */
  consumption: boolean;
  /** Adds to the cash expected outflow. */
  cash: boolean;
  confidence?: 'high' | 'medium' | 'low';
  note?: string | null;
};

export type BudgetSavingsSuggestion = {
  key: string;
  label: string;
  amountCents: number;
  categoryId: number;
  recordTypeId: number;
  includedLineId: number | null;
  includedAmountCents: number | null;
};

export type BudgetObligationsView = {
  items: BudgetObligation[];
  financingCents: number;
  vehicleCents: number;
  savingsCents: number;
  cardCents: number;
  totalConsumptionCents: number;
  totalCashCents: number;
};

export type BudgetCashView = {
  currentCashCents: number;
  remainingIncomeCents: number;
  remainingExpenseCents: number;
  obligationsCashCents: number;
  expectedEndCashCents: number;
};

export type BudgetBalanceView = {
  actualIncomeCents: number;
  actualExpenseCents: number;
  actualNetCents: number;
  expectedIncomeCents: number;
  expectedExpenseCents: number;
  expectedNetCents: number;
  expectedEndBalanceCents: number;
  remainingIncomeCents: number;
  remainingExpenseCents: number;
  remainingPlanExpenseCents: number;
  uncoveredFixedCents: number;
  daysRemaining: number;
  dailyAvailableCents: number;
  hasIncomeLines: boolean;
};

export type BudgetInsight =
  | { kind: 'over_budget'; lineId: number; amountCents: number }
  | { kind: 'near_limit'; lineId: number; usagePercent: number }
  | { kind: 'unplanned_spending'; categoryId: number | null; amountCents: number }
  | { kind: 'fixed_uncovered'; fixedId: number; amountCents: number }
  | { kind: 'fixed_pending'; fixedId: number; day: number; amountCents: number }
  | { kind: 'no_plan'; groupId: number }
  | { kind: 'empty_plan'; planId: number };

export type BudgetPlanView = {
  planId: number;
  groupId: number;
  planName: string;
  month: number;
  year: number;
  templateId: number | null;
  templateName: string | null;
  alertThresholdPercent: number;
  notes: string | null;
  periodStart: number;
  periodEnd: number;
  daysInPeriod: number;
  daysElapsed: number;
  daysRemaining: number;
  periodRelation: BudgetPeriodRelation;
  balance: BudgetBalanceView;
  totals: {
    plannedIncomeCents: number;
    plannedExpenseCents: number;
    actualIncomeCents: number;
    actualExpenseCents: number;
    plannedNetCents: number;
    actualNetCents: number;
    pendingFixedCents: number;
  };
  lines: BudgetLineComparison[];
  unplanned: BudgetUnplannedBucket[];
  fixedCommitments: BudgetFixedCommitment[];
  insights: BudgetInsight[];
};

export type BudgetComparisonInput = {
  plan: BudgetPlan;
  planName: string;
  month: number;
  year: number;
  periodStart: number;
  periodEnd: number;
  templateName: string | null;
  lines: BudgetLine[];
  records: {
    id: number;
    amount: number;
    category_id: number | null;
    record_type_id: number | null;
    fixed_id: number | null;
  }[];
  fixeds: FixedRecord[];
  categories: Pick<Category, 'id' | 'category_name'>[];
  recordTypes: Pick<RecordType, 'id' | 'type_name' | 'effect' | 'record_color'>[];
  excludedRecordTypeIds?: number[];
  now?: Date;
};

export type BudgetTemplateItemView = {
  id: number;
  templateId: number;
  categoryId: number;
  categoryName: string;
  recordTypeId: number;
  typeName: string;
  effect: '+' | '-' | '=' | null;
  amountCents: number;
  priority: number;
  notes: string | null;
  sortOrder: number;
  scope: BudgetLineScope;
  fixedId: number | null;
  fixedName: string | null;
};

export type BudgetTemplateView = {
  id: number;
  name: string;
  description: string | null;
  notes: string | null;
  isDefault: boolean;
  items: BudgetTemplateItemView[];
  totalCents: number;
};
