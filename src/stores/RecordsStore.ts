import { create } from "zustand";
import { Group, PaidCreditWithRelations, PersonSettlement, RecordView, RecordWithRelations } from "../interfaces/schema";

interface RecordsState {
  group: Group | null;
  groups: Group[] | [];
  records: RecordView[] | [];
  paidCredits: PaidCreditWithRelations[] | [];
  settlements: PersonSettlement[];
  setGroup: (group: Group) => void;
  setRecords: (records: RecordWithRelations[] | undefined) => void;
  setGroups: (groups: Group[]) => void;
  setPaidCredits: (paidCredits: PaidCreditWithRelations[]) => void;
  setSettlements: (settlements: PersonSettlement[]) => void;
}

const useRecordsStore = create<RecordsState>()((set, get) => ({
  group: null,
  records: [],
  groups: [],
  paidCredits: [],
  settlements: [],

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
  },
  setSettlements: (settlements) => {
    set(() => ({
      settlements
    }))
  }
}));

export default useRecordsStore;
