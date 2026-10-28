/**
 * Backwards-compatible type aliases.
 *
 * These names used to be duplicated hand-written interfaces. They now point at
 * the canonical types in `src/interfaces/schema.ts` so the app has one source
 * of truth while older imports are migrated.
 */
export type {
  Group as Groups,
  PaymentType as PaymentTypes,
  PaymentMethod as PaymentMethods,
  Category as Categories,
  RecordType as RecordTypes,
  FixedRecord as Fixed,
  RecordEntry as Records,
  PaidCredit as PaidCredits,
  BudgetTemplate,
  BudgetTemplateItem as BudgetTemplateItems,
  Budget as Budgets,
  Saving as Savings,
  SavingsHistoryEntry as SavingsHistory,
  Migration as Migrations,
  RecordView as RecordJoined,
  FixedView as FixedJoined,
  BudgetItemView as BudgetItemJoined,
  BudgetItemView as BudgetJoined,
  PaymentMethodView as PaymentMethodsJoined,
} from '@/src/interfaces/schema';
