/**
 * Canonical entity types.
 *
 * Money is stored as integer cents. Dates are Unix timestamps in milliseconds.
 * `deleted_at` is also stored as a millisecond timestamp, or null when active.
 */

export type Cents = number;
export type TimestampMs = number;

export interface SoftDeletable {
  deleted_at?: TimestampMs | null;
}

interface Entity {
  id?: number;
}

export interface Group extends SoftDeletable, Entity {
  group_name: string;
  goal: Cents;
  year: number;
  month: number;
}

export interface PaymentType extends SoftDeletable, Entity {
  payment_type_name?: string | null;
  payment_color?: string | null;
}

export interface PaymentMethod extends SoftDeletable, Entity {
  method_name: string;
  closing_date?: number | null;
  payment_type_id?: number | null;
  payment_date?: number | null;
}

export interface Category extends SoftDeletable, Entity {
  category_name: string;
}

export interface RecordType extends SoftDeletable, Entity {
  type_name: string;
  effect?: string | null;
  record_color?: string | null;
}

export interface FixedRecord extends SoftDeletable, Entity {
  fixed_amount: Cents;
  fixed_name: string;
  fixed_day: number;
  record_type_id?: number | null;
  category_id?: number | null;
  payment_method_id?: number | null;
}

export interface RecordEntry extends SoftDeletable, Entity {
  amount: Cents;
  record_name: string;
  date: TimestampMs;
  record_type_id?: number | null;
  group_id?: number | null;
  category_id?: number | null;
  payment_method_id?: number | null;
  fixed_id?: number | null;
  paid_credit_id?: number | null;
}

export type RecordFormEntry = Partial<RecordWithRelations> & {
  paid_method_id?: number | null;
};

export interface PaidCredit extends SoftDeletable, Entity {
  amount: Cents;
  date: TimestampMs;
  group_id?: number | null;
  payment_method_id?: number | null;
}

export interface BudgetTemplate extends SoftDeletable, Entity {
  template_name: string;
  description?: string | null;
}

export interface BudgetTemplateItem extends SoftDeletable, Entity {
  budget_template_id: number;
  amount: Cents;
  record_type_id: number;
  category_id: number;
}

export interface Budget extends SoftDeletable, Entity {
  amount: Cents;
  record_type_id?: number | null;
  group_id?: number | null;
  category_id?: number | null;
}

export interface Saving extends SoftDeletable, Entity {
  saving_name: string;
  amount: Cents;
}

export interface SavingsHistoryEntry extends SoftDeletable, Entity {
  savings_id?: number | null;
  previous_amount: Cents;
  new_amount: Cents;
  change_date: TimestampMs;
}

export interface Migration extends Entity {
  migration_name: string;
  applied_at: TimestampMs;
}

export interface FuelRefill extends SoftDeletable, Entity {
  date?: TimestampMs | null;
  odometer_reading: number;
  total_cost: Cents;
  gallons: number;
  price_per_gallon: Cents;
  is_full_tank: boolean | number;
  notes?: string | null;
}

export interface TripLog extends SoftDeletable, Entity {
  date?: TimestampMs | null;
  distance_traveled: number;
  average_consumption?: number | null;
  is_counter_reset?: boolean | number | null;
  trip_type?: string | null;
  notes?: string | null;
}

export type Insertable<T> = Omit<T, 'id' | 'deleted_at'>;

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
