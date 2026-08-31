// Base para entidades que implementan Soft Delete
export interface SoftDeletable {
  deleted_at?: string | null; // Almacenado como DATETIME/ISO string o NULL
}

// 1. Groups
export interface Group extends SoftDeletable {
  id: number;
  group_name: string;
  goal: number;
  year: number;
  month: number;
}

// 2. PaymentTypes
export interface PaymentType extends SoftDeletable {
  id: number;
  payment_type_name?: string | null;
  payment_color?: string | null;
}

// 3. PaymentMethods
export interface PaymentMethod extends SoftDeletable {
  id: number;
  method_name: string;
  closing_date?: number | null;
  payment_type_id?: number | null;
  payment_date?: number | null; // Agregado en migración
}

// 4. Categories
export interface Category extends SoftDeletable {
  id: number;
  category_name: string;
}

// 5. RecordTypes
export interface RecordType extends SoftDeletable {
  id: number;
  type_name: string;
  effect?: string | null;
  record_color?: string | null;
}

// 6. Fixed
export interface FixedRecord extends SoftDeletable {
  id: number;
  fixed_amount: number;
  fixed_name: string;
  fixed_day: number;
  record_type_id?: number | null;
  category_id?: number | null;
  payment_method_id?: number | null;
}

// 7. Records
export interface RecordEntry extends SoftDeletable {
  id: number;
  amount: number;
  record_name: string;
  date: number; // Unix timestamp en ms o s
  record_type_id?: number | null;
  group_id?: number | null;
  category_id?: number | null;
  payment_method_id?: number | null;
  fixed_id?: number | null;
  paid_credit_id?: number | null; // Agregado en migración
}

// 8. PaidCredits
export interface PaidCredit extends SoftDeletable {
  id: number;
  amount: number;
  date: number;
  group_id?: number | null;
  payment_method_id?: number | null;
}

// 9. BudgetTemplates
export interface BudgetTemplate extends SoftDeletable {
  id: number;
  template_name: string;
  description?: string | null;
}

// 10. BudgetTemplateItems
export interface BudgetTemplateItem extends SoftDeletable {
  id: number;
  budget_template_id: number;
  amount: number;
  record_type_id: number;
  category_id: number;
}

// 11. Budgets
export interface Budget extends SoftDeletable {
  id: number;
  amount: number;
  record_type_id?: number | null;
  group_id?: number | null;
  category_id?: number | null;
}

// 12. Savings
export interface Saving extends SoftDeletable {
  id: number;
  saving_name: string;
  amount: number;
}

// 13. SavingsHistory
export interface SavingsHistoryEntry extends SoftDeletable {
  id: number;
  savings_id?: number | null;
  previous_amount: number;
  new_amount: number;
  change_date: number;
}

// 14. Migrations (Tabla interna de control)
export interface Migration {
  id: number;
  migration_name: string;
  applied_at: number;
}

// Omite 'id' y 'deleted_at' para operaciones INSERT
export type Insertable<T> = Omit<T, 'id' | 'deleted_at'>;

// Ejemplo de uso para insertar un nuevo grupo:
// const newGroup: Insertable<Group> = { group_name: 'Viaje', goal: 500, year: 2026, month: 8 };

///                 Relations               ///

// ----------------------------------------------------------------------
// 1. PaymentMethods
// ----------------------------------------------------------------------
export interface PaymentMethodWithRelations extends PaymentMethod {
  PaymentTypes?: PaymentType | null;
}

// ----------------------------------------------------------------------
// 2. Fixed
// ----------------------------------------------------------------------
export interface FixedRecordWithRelations extends FixedRecord {
  RecordTypes?: RecordType | null;
  Categories?: Category | null;
  PaymentMethods?: PaymentMethodWithRelations | null; // Soporta anidación
}

// ----------------------------------------------------------------------
// 3. PaidCredits
// ----------------------------------------------------------------------
export interface PaidCreditWithRelations extends PaidCredit {
  Groups?: Group | null;
  PaymentMethods?: PaymentMethodWithRelations | null;
}

// ----------------------------------------------------------------------
// 4. Records (Soporta relaciones anidadas profundas)
// ----------------------------------------------------------------------
export interface RecordWithRelations extends RecordEntry {
  RecordTypes?: RecordType | null;
  Groups?: Group | null;
  Categories?: Category | null;
  PaymentMethods?: PaymentMethodWithRelations | null; // p. ej: record.PaymentMethods.PaymentTypes
  Fixed?: FixedRecordWithRelations | null;             // p. ej: record.Fixed.Categories
  PaidCredits?: PaidCreditWithRelations | null;       // p. ej: record.PaidCredits.PaymentMethods
}

// ----------------------------------------------------------------------
// 5. BudgetTemplateItems
// ----------------------------------------------------------------------
export interface BudgetTemplateItemWithRelations extends BudgetTemplateItem {
  BudgetTemplates?: BudgetTemplate | null;
  RecordTypes?: RecordType | null;
  Categories?: Category | null;
}

// ----------------------------------------------------------------------
// 6. BudgetTemplates (Relación 1 a Muchos / Arreglo)
// ----------------------------------------------------------------------
export interface BudgetTemplateWithRelations extends BudgetTemplate {
  BudgetTemplateItems?: BudgetTemplateItemWithRelations[];
}

// ----------------------------------------------------------------------
// 7. Budgets
// ----------------------------------------------------------------------
export interface BudgetWithRelations extends Budget {
  RecordTypes?: RecordType | null;
  Groups?: Group | null;
  Categories?: Category | null;
}

// ----------------------------------------------------------------------
// 8. SavingsHistory
// ----------------------------------------------------------------------
export interface SavingsHistoryWithRelations extends SavingsHistoryEntry {
  Savings?: Saving | null;
}