/**
 * Canonical entity types.
 *
 * The entity interfaces are generated from `src/db/schema/tables.ts`.
 * Money is stored as integer cents. Dates are Unix timestamps in milliseconds.
 * `deleted_at` is also stored as a millisecond timestamp, or null when active.
 */
import type {
  BudgetLine,
  BudgetPlan,
  BudgetTemplate,
  BudgetTemplateItem,
  Category,
  Cents,
  Entity,
  FixedRecord,
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
  Vehicle,
  VehicleExpenseLink,
  VehicleFuelEntry,
  VehicleMaintenanceEntry,
  VehicleMaintenanceItem,
  VehicleReminder,
  VehicleSetting,
} from '../db/schema/generated/types';

export type {
  BudgetLine,
  BudgetPlan,
  BudgetTemplate,
  BudgetTemplateItem,
  Category,
  Cents,
  Entity,
  FixedRecord,
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
  Vehicle,
  VehicleExpenseLink,
  VehicleFuelEntry,
  VehicleMaintenanceEntry,
  VehicleMaintenanceItem,
  VehicleReminder,
  VehicleSetting,
} from '../db/schema/generated/types';

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
  Fixed?: FixedRecordWithRelations | null;
}

export interface BudgetTemplateWithRelations extends BudgetTemplate {
  BudgetTemplateItems?: BudgetTemplateItemWithRelations[];
}

export interface BudgetPlanWithRelations extends BudgetPlan {
  Groups?: Group | null;
  BudgetTemplates?: BudgetTemplate | null;
  BudgetLines?: BudgetLineWithRelations[];
}

export interface BudgetLineWithRelations extends BudgetLine {
  BudgetPlans?: BudgetPlanWithRelations | null;
  Categories?: Category | null;
  RecordTypes?: RecordType | null;
  Fixed?: FixedRecordWithRelations | null;
  BudgetTemplateItems?: BudgetTemplateItemWithRelations | null;
}

export interface SavingsHistoryWithRelations extends SavingsHistoryEntry {
  Savings?: Saving | null;
}

export interface VehicleFuelEntryWithRelations extends VehicleFuelEntry {
  Vehicles?: Vehicle | null;
}

export interface VehicleMaintenanceItemWithRelations extends VehicleMaintenanceItem {
  VehicleMaintenance?: VehicleMaintenanceEntry | null;
}

export interface VehicleMaintenanceEntryWithRelations extends VehicleMaintenanceEntry {
  Vehicles?: Vehicle | null;
  VehicleMaintenanceItems?: VehicleMaintenanceItemWithRelations[];
}

export interface VehicleReminderWithRelations extends VehicleReminder {
  Vehicles?: Vehicle | null;
}

export interface VehicleSettingWithRelations extends VehicleSetting {
  Categories?: Category | null;
  PaymentMethods?: PaymentMethodWithRelations | null;
}

export interface VehicleExpenseLinkWithRelations extends VehicleExpenseLink {
  Records?: RecordWithRelations | null;
  VehicleFuelEntries?: VehicleFuelEntry | null;
  VehicleMaintenance?: VehicleMaintenanceEntry | null;
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

export interface BudgetLineView extends BudgetLineWithRelations {
  category_name?: string | null;
  type_name?: string | null;
  effect?: string | null;
  record_color?: string | null;
  fixed_name?: string | null;
  fixed_day?: number | null;
}
