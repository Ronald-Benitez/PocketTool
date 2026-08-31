export interface Groups {
  id?: number;
  group_name: string;
  goal: number;
  year: number;
  month: number;
}

export interface PaymentTypes {
  id?: number;
  payment_type_name: string | null;
  payment_color: string | null;
}

export interface PaymentMethods {
  id?: number;
  method_name: string;
  closing_date: number | null;
  payment_type_id: number | null;
}

export interface Categories {
  id?: number;
  category_name: string;
}

export interface RecordTypes {
  id?: number;
  type_name: string;
  effect: string | null;
  record_color: string | null;
}

export interface Fixed {
  id?: number;
  fixed_amount: number;
  fixed_name: string;
  fixed_day: number;
  record_type_id: number | null;
  category_id: number | null;
  payment_method_id: number | null;
}

export interface Records {
  id?: number;
  amount: number;
  record_name: string;
  date: number;
  record_type_id: number | null;
  group_id: number | null;
  category_id: number | null;
  payment_method_id: number | null;
  fixed_id: number | null;
}

export interface PaidCredits {
  id?: number;
  amount: number;
  date: number;
  group_id: number | null;
  payment_method_id: number | null;
}

export interface BudgetTemplates {
  id?: number;
  template_name: string;
  description: string | null;
}

export interface BudgetTemplateItems {
  id?: number;
  budget_template_id: number;
  amount: number;
  record_type_id: number;
  category_id: number;
}

export interface Budgets {
  id?: number;
  amount: number;
  record_type_id: number | null;
  group_id: number | null;
  category_id: number | null;
}

export interface Savings {
  id?: number;
  saving_name: string;
  amount: number;
}

export interface SavingsHistory {
  id?: number;
  savings_id: number | null;
  previous_amount: number;
  new_amount: number;
  change_date: number;
}

export interface Migrations {
  id?: number;
  migration_name: string;
  applied_at: number;
}
