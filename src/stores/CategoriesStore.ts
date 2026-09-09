import { create } from "zustand";
import { Category } from "../interfaces/schema";

interface CategoriesState {
  categories: Category[] | null;
  setCategories: (categories: Category[]) => void;
}

const useCategoriesStore = create<CategoriesState>()((set) => ({
  categories: null,
  setCategories: async (categories) => {
    set(() => ({
      categories,
    }));
  },
}));

export default useCategoriesStore;
