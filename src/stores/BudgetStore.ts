import { create } from "zustand";
import { Budget, Group, RecordI } from "../interfaces";
import { ResumeTotalsBudget } from "../db";

interface RecordsState {
  budgets: Budget[] | [];
  resumes: ResumeTotalsBudget | null;
  setBudgets: (budgets: Budget[]) => void;
  setResumes: (resumes: ResumeTotalsBudget) => void;
}

const useBudgetStore = create<RecordsState>()((set, get) => ({
  budgets: [],
  resumes: null,
  setBudgets: (budgets) => {
    set(() => ({
      budgets,
    }));
  },
  setResumes: (resumes: ResumeTotalsBudget) => {
    set(() => ({
      resumes,
    }));
  },
}));

export default useBudgetStore;
