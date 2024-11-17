import { create } from "zustand";
import { Group, RecordI } from "../interfaces";
import { ResumeTotals } from "../db";

interface RecordsState {
  group: Group | null;
  groups: Group[] | [];
  records: RecordI[] | [];
  balance: number;
  resumes: ResumeTotals | null;
  setBalance: () => void;
  setGroup: (group: Group) => void;
  setRecords: (records: RecordI[]) => void;
  setResumes: (resumes: ResumeTotals) => void;
  setGroups: (groups: Group[]) => void;
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
        if (record.record_type === "income") {
          return accumulator + record.amount;
        } else if (record.record_type === "expense") {
          return accumulator - record.amount;
        } else {
          return accumulator;
        }
      }, 0),
    })),

  setGroup: async (group: Group) => {
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
  setResumes: (resumes: ResumeTotals) => {
    set(() => ({
      resumes,
    }));
  },
  setGroups: (groups: Group[]) => {
    set(() => ({
      groups,
    }));
  },
}));

export default useRecordsStore;
