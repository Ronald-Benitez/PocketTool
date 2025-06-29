import { create } from "zustand";
import { Group, RecordI } from "../interfaces";
import { Records, Budgets, Categories, Groups, Migrations, PaymentMethods, PaymentTypes, RecordJoined, RecordTypes, Savings, SavingsHistory, PaidCredits } from "@/src/db/types/tables";
import useConfigs from '@/src/hooks/useConfigs';

interface RecordsState {
  group: Groups | null;
  groups: Groups[] | [];
  records: RecordJoined[] | [];
  paidCredits: PaidCredits[] | [];
  setGroup: (group: Groups) => void;
  setRecords: (records: RecordJoined[] | undefined) => void;
  setGroups: (groups: Groups[]) => void;
  setPaidCredits: (paidCredits: PaidCredits[]) => void;
}

const useRecordsStore = create<RecordsState>()((set, get) => ({
  group: null,
  records: [],
  groups: [],
  paidCredits: [],

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
  },
  setGroups: (groups) => {
    set(() => ({
      groups,
    }));
  },
  setPaidCredits: (paidCredits) => {
    set(() => ({
      paidCredits
    }))
  }
}));

export default useRecordsStore;
