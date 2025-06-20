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
    payment_method_id: number
}

export interface RecordJoined extends Records, RecordTypes, Categories, PaymentMethods, PaymentTypes, Groups {
    record_id: number,
    group_id: number,
    category_id: number,
    payment_method_id: number,
    payment_type_id: number
}

export interface Budgets {
    id?: number,
    amount: number,
    record_type_id: number,
    group_id: number,
    category_id: number,
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