import { create } from "zustand";
import { Group, RecordI } from "../interfaces";
import { Records, Budgets, Categories, Groups, Migrations, PaymentMethods, PaymentTypes, RecordJoined, RecordTypes, Savings, SavingsHistory } from "@/src/db/types/tables";
import useConfigs from '@/src/hooks/useConfigs';

interface RecordsState {
  group: Groups | null;
  groups: Groups[] | [];
  records: RecordJoined[] | [];
  balance: number;
  resumes: ResumeTotals | null;
  setBalance: () => void;
  setGroup: (group: Groups) => void;
  setRecords: (records: RecordJoined[] | undefined) => void;
  setResumes: (resumes: ResumeTotals) => void;
  setGroups: (groups: Groups[]) => void;
}

interface TodayTotals {
  totalIncomeToday: number;
  totalExpenseToday: number;
}

export interface ResumeTotals {
  // incomeCredit: number | null;
  // incomeDebit: number | null;
  // expenseCredit: number | null;
  // expenseDebit: number | null;
  // transferTotal: number | null;
  categoryTotals:
  | {
    category_name: string;
    totalIncome: number;
    totalExpense: number;
    totalTransfer: number;
    category_id: number;
  }[]
  | null;
  paymentMethodTotals:
  | {
    method_name: string;
    totalIncome: number;
    totalExpense: number;
    totalTransfer: number;
    type: string;
  }[]
  | null;
  expensesTotal: number | null;
  incomesTotal: number | null;
  balance: number;
  totalWithoutDebts: number;
  todayTotal: TodayTotals | null;
  transferDebit: number | null;
  transferCredit: number | null;
}

const useRecordsStore = create<RecordsState>()((set, get) => ({
  group: null,
  records: [],
  balance: 0,
  resumes: null,
  groups: [],

  setBalance: () =>
    set((state) => ({
      balance: state.records.reduce((accumulator, record) => {
        if (record.record_type_id === 1) {
          return accumulator + record.amount;
        } else if (record.record_type_id === 2) {
          return accumulator - record.amount;
        } else {
          return accumulator;
        }
      }, 0),
    })),

  setGroup: async (group) => {
    set(() => ({
      group,
    }));
  },
  setRecords: (records) => {
    const mappedRecords = records?.map((record) => ({
      ...record,
      id: record.record_id,
    })) || [];
    set(() => ({
      records: mappedRecords,
    }));
    get().setBalance();
  },
  setResumes: (resumes) => {
    set(() => ({
      resumes,
    }));
  },
  setGroups: (groups) => {
    set(() => ({
      groups,
    }));
  },
}));

const calculateResumeTotals = (records: RecordJoined[]): ResumeTotals => {
  
}

export default useRecordsStore;
