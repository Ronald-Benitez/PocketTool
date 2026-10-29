/**
 * Canonical entity types.
 *
 * The entity interfaces are generated from `src/db/schema/tables.ts`.
 * Money is stored as integer cents. Dates are Unix timestamps in milliseconds.
 * `deleted_at` is also stored as a millisecond timestamp, or null when active.
 */
import type {
  Budget,
  BudgetTemplate,
  BudgetTemplateItem,
  Category,
  Cents,
  Entity,
  FixedRecord,
  FuelRefill,
  Group,
  Migration,
  PaidCredit,
  PaymentMethod,
  PaymentType,
  RecordEntry,
  RecordType,
  Saving,
  SavingsHistoryEntry,
  SoftDeletable,
  TimestampMs,
  TripLog,
} from '@/src/db/schema/generated/types';

export type {
  Budget,
  BudgetTemplate,
  BudgetTemplateItem,
  Category,
  Cents,
  Entity,
  FixedRecord,
  FuelRefill,
  Group,
  Migration,
  PaidCredit,
  PaymentMethod,
  PaymentType,
  RecordEntry,
  RecordType,
  Saving,
  SavingsHistoryEntry,
  SoftDeletable,
  TimestampMs,
  TripLog,
} from '@/src/db/schema/generated/types';

export type RecordFormEntry = Partial<RecordWithRelations> & {
  paid_method_id?: number | null;
};

export type NewEntity<T> = Omit<T, 'id' | 'deleted_at'>;
export type UpdateEntity<T> = Partial<T>;
export type WithRelations<T, R> = T & R;
export type Insertable<T> = NewEntity<T>;

///                 Relations               ///

export interface PaymentMethodWithRelations extends PaymentMethod {
  PaymentTypes?: PaymentType | null;
}

export interface FixedRecordWithRelations extends FixedRecord {
  RecordTypes?: RecordType | null;
  Categories?: Category | null;
  PaymentMethods?: PaymentMethodWithRelations | null;
}

export interface PaidCreditWithRelations extends PaidCredit {
  Groups?: Group | null;
  PaymentMethods?: PaymentMethodWithRelations | null;
}

export interface RecordWithRelations extends RecordEntry {
  RecordTypes?: RecordType | null;
  Groups?: Group | null;
  Categories?: Category | null;
  PaymentMethods?: PaymentMethodWithRelations | null;
  Fixed?: FixedRecordWithRelations | null;
  PaidCredits?: PaidCreditWithRelations | null;
}

export interface BudgetTemplateItemWithRelations extends BudgetTemplateItem {
  BudgetTemplates?: BudgetTemplate | null;
  RecordTypes?: RecordType | null;
  Categories?: Category | null;
}

export interface BudgetTemplateWithRelations extends BudgetTemplate {
  BudgetTemplateItems?: BudgetTemplateItemWithRelations[];
}

export interface BudgetWithRelations extends Budget {
  RecordTypes?: RecordType | null;
  Groups?: Group | null;
  Categories?: Category | null;
}

export interface SavingsHistoryWithRelations extends SavingsHistoryEntry {
  Savings?: Saving | null;
}

/**
 * Flattened shapes used by table/list screens. Repositories populate these
 * convenience fields from the nested relations returned by the ORM.
 */
export interface RecordView extends RecordWithRelations {
  record_id?: number;
  group_name?: string | null;
  category_name?: string | null;
  method_name?: string | null;
  payment_type_id?: number | null;
  payment_type_name?: string | null;
  payment_color?: string | null;
  type_name?: string | null;
  effect?: string | null;
  record_color?: string | null;
  paid_method_id?: number | null;
  paid_method_amount?: Cents | null;
}

export interface FixedView extends FixedRecordWithRelations {
  fixed_id?: number;
  category_name?: string | null;
  method_name?: string | null;
  payment_type_id?: number | null;
  payment_type_name?: string | null;
  payment_color?: string | null;
  type_name?: string | null;
  effect?: string | null;
  record_color?: string | null;
}

export interface PaymentMethodView extends PaymentMethodWithRelations {
  payment_type_name?: string | null;
  payment_color?: string | null;
}

export interface BudgetItemView extends BudgetWithRelations {
  budget_template_item_id?: number;
  category_name?: string | null;
  type_name?: string | null;
  effect?: string | null;
  record_color?: string | null;
}
