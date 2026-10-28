import { create } from "zustand";
import type { BudgetItemView } from "../interfaces/schema";
import { ResumeTotalsBudget } from "../db";

interface RecordsState {
  budgets: BudgetItemView[] | [];
  resumes: ResumeTotalsBudget | null;
  setBudgets: (budgets: BudgetItemView[]) => void;
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
