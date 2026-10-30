import { Category, Group, Migration, PaymentType, Saving, SavingsHistoryWithRelations, FixedView, RecordType, PaymentMethodWithRelations } from "../interfaces/schema";
import { create } from "zustand";

interface TableState {
    Categories: Category[];
    Groups: Group[];
    Migrations: Migration[];
    PaymentMethods: PaymentMethodWithRelations [];
    PaymentTypes: PaymentType[];
    RecordTypes: RecordType[];
    Savings: Saving[];
    SavingsHistory: SavingsHistoryWithRelations[];
    Fixeds: FixedView[],
    setCategories: (categories: Category[]) => void;
    setGroups: (groups: Group[]) => void;
    setMigrations: (migrations: Migration[]) => void;
    setPaymentMethods: (paymentMethods: PaymentMethodWithRelations[]) => void;
    setPaymentTypes: (paymentTypes: PaymentType[]) => void;
    setRecordTypes: (recordTypes: RecordType[]) => void;
    setSavings: (savings: Saving[]) => void;
    setSavingsHistory: (savingsHistory: SavingsHistoryWithRelations[]) => void;
    setFixeds: (fixeds: FixedView[] | undefined) => void
}

export const useDataStore = create<TableState>()((set) => ({
    Categories: [],
    Groups: [],
    Migrations: [],
    PaymentMethods: [],
    PaymentTypes: [],
    RecordTypes: [],
    Savings: [],
    SavingsHistory: [],
    Fixeds: [],

    setCategories: (categories) => set({ Categories: categories }),
    setGroups: (groups) => set({ Groups: groups }),
    setMigrations: (migrations) => set({ Migrations: migrations }),
    setPaymentMethods: (paymentMethods) => set({ PaymentMethods: paymentMethods }),
    setPaymentTypes: (paymentTypes) => set({ PaymentTypes: paymentTypes }),
    setRecordTypes: (recordTypes) => set({ RecordTypes: recordTypes }),
    setSavings: (savings) => set({ Savings: savings }),
    setSavingsHistory: (savingsHistory) => set({ SavingsHistory: savingsHistory }),
    setFixeds: (fixeds) => set({ Fixeds: fixeds || [] })

}));

