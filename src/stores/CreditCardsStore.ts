import { create } from "zustand";
import { Budget, Group, RecordI } from "../interfaces";
import { ResumeByCreditCards } from "../db";

interface CreditCardsState {
  creditCards: ResumeByCreditCards[] | null;
  setCreditCards: (resumes: ResumeByCreditCards[]) => void;
}

const useCreditCardStore = create<CreditCardsState>()((set, get) => ({
  creditCards: [],
  setCreditCards: (creditCards) => {
    set(() => ({
      creditCards,
    }));
  },
}));

export default useCreditCardStore;
