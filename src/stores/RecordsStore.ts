import { create } from "zustand";
import { Group, RecordI } from "../interfaces";
import { ResumeTotals } from "../db";
import { Records, Budgets, Categories, Groups, Migrations, PaymentMethods, PaymentTypes, RecordJoined, RecordTypes, Savings, SavingsHistory } from "@/src/db/types/tables";


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
    set(() => ({
      records,
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

export default useRecordsStore;
