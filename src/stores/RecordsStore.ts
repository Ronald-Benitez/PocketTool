import { create } from "zustand";
import { Group, PaidCreditWithRelations, RecordView, RecordWithRelations } from "../interfaces/schema";

interface RecordsState {
  group: Group | null;
  groups: Group[] | [];
  records: RecordView[] | [];
  paidCredits: PaidCreditWithRelations[] | [];
  setGroup: (group: Group) => void;
  setRecords: (records: RecordWithRelations[] | undefined) => void;
  setGroups: (groups: Group[]) => void;
  setPaidCredits: (paidCredits: PaidCreditWithRelations[]) => void;
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
    set(() => ({
      records,
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
