export interface Groups {
    id?: number,
    group_name: string,
    goal: number,
    year: number,
    month: number
}

export interface PaymentTypes {
    id?: number,
    payment_type_name: string,
    payment_color: string
}

export interface PaymentMethods {
    id?: number,
    method_name: string,
    closing_date: number
    payment_type_id?: number
}

export interface Categories {
    id?: number,
    category_name: string
}

export interface RecordTypes {
    id?: number,
    type_name: string,
    effect: string,
    record_color: string
}

export interface Records {
    id?: number,
    amount: number,
    record_name: string,
    date: number,
    record_type_id: number,
    group_id: number,
    category_id: number,
    payment_method_id: number,
    fixed_id?: number,
    paid_credit_id?: number,
    paid_method_id?: number,
    paid_method_amount?: number
}

export interface RecordJoined extends Records, RecordTypes, Categories, PaymentMethods, PaymentTypes, Groups {
    record_id: number,
    group_id: number,
    fixed_id?: number,
    category_id: number,
    payment_method_id: number,
    payment_type_id: number
}

export interface Fixed {
    id?: number,
    fixed_amount: number,
    fixed_name: string,
    fixed_day: number,
    record_type_id: number,
    category_id: number,
    payment_method_id: number
}

export interface FixedJoined extends Fixed, RecordTypes, Categories, PaymentMethods, PaymentTypes {
    fixed_id: number,
    record_id: number,
    category_id: number,
    payment_method_id: number,
    payment_type_id: number
}

export interface PaidCredits {
    id?: number,
    amount: number,
    date: number,
    group_id: number,
    payment_method_id: number
}

export interface Budgets {
    id?: number,
    amount: number,
    record_type_id: number,
    group_id: number,
    category_id: number,
    payment_method_id: number,
}

export interface BudgetTemplateItems {
    id?: number,
    budget_template_id: number,
    amount: number,
    record_type_id: number,
    category_id: number,
}

export interface BudgetTemplate {
    id?: number,
    template_name: string,
    description?: string
}

export interface BudgetItemJoined extends BudgetTemplateItems, BudgetTemplate, RecordTypes, Categories {
    budget_template_item_id: number,
    record_type_id: number,
    category_id: number
    budget_item_id: number
}

export interface BudgetJoined extends Budgets, RecordTypes, Categories, Groups{
    budget_id: number,
    group_id: number,
    record_type_id: number,
    category_id: number,
    payment_method_id: number,
    payment_type_id: number
}

export interface Savings {
    id?: number,
    saving_name: string,
    amount: number,

}

export interface SavingsHistory {
    id?: number,
    savings_id: number,
    previous_amount: number,
    new_amount: number,
    change_date: number
}

export interface Migrations {
    id?: number,
    migration_name: string,
    applied_at: number
}