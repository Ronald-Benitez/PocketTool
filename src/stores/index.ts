import { Records, Budgets, Categories, Groups, Migrations, PaymentMethods, PaymentTypes, RecordJoined, RecordTypes, Savings, SavingsHistory, FixedJoined } from "../db/types/tables";
import { create } from "zustand";

export type PaymentMethodsJoined = PaymentMethods & PaymentTypes;

interface TableState {
    Budgets: Budgets[];
    Categories: Categories[];
    Groups: Groups[];
    Migrations: Migrations[];
    PaymentMethods: PaymentMethodsJoined[];
    PaymentTypes: PaymentTypes[];
    RecordTypes: RecordTypes[];
    Savings: Savings[];
    SavingsHistory: SavingsHistory[];
    Fixeds: FixedJoined[],
    setBudgets: (budgets: Budgets[]) => void;
    setCategories: (categories: Categories[]) => void;
    setGroups: (groups: Groups[]) => void;
    setMigrations: (migrations: Migrations[]) => void;
    setPaymentMethods: (paymentMethods: PaymentMethodsJoined[]) => void;
    setPaymentTypes: (paymentTypes: PaymentTypes[]) => void;
    setRecordTypes: (recordTypes: RecordTypes[]) => void;
    setSavings: (savings: Savings[]) => void;
    setSavingsHistory: (savingsHistory: SavingsHistory[]) => void;
    setFixeds: (fixeds: FixedJoined[] | undefined) => void
}

export const useDataStore = create<TableState>()((set) => ({
    Budgets: [],
    Categories: [],
    Groups: [],
    Migrations: [],
    PaymentMethods: [],
    PaymentTypes: [],
    Records: [],
    RecordTypes: [],
    Savings: [],
    SavingsHistory: [],
    Fixeds: [],

    setBudgets: (budgets) => set({ Budgets: budgets }),
    setCategories: (categories) => set({ Categories: categories }),
    setGroups: (groups) => set({ Groups: groups }),
    setMigrations: (migrations) => set({ Migrations: migrations }),
    setPaymentMethods: (paymentMethods) => set({ PaymentMethods: paymentMethods }),
    setPaymentTypes: (paymentTypes) => set({ PaymentTypes: paymentTypes }),
    setRecordTypes: (recordTypes) => set({ RecordTypes: recordTypes }),
    setSavings: (savings) => set({ Savings: savings }),
    setSavingsHistory: (savingsHistory) => set({ SavingsHistory: savingsHistory }),
    setFixeds: (fixeds) => {
        const mapped = fixeds?.map((fix) => ({
            ...fix,
            id: fix.fixed_id,
        })) || [];
        set({ Fixeds: mapped })
    }

}));

