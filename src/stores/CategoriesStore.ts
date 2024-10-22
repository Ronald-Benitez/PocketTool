import { create } from "zustand";
import { Category } from "../interfaces";

interface CategiesSate {
  categories: Category[] | null;
  setCategories: (categories: Category[]) => void;
}

const useCategoriesStore = create<CategiesSate>()((set) => ({
  categories: null,
  setCategories: async (categories) => {
    set(() => ({
      categories,
    }));
  },
}));

export default useCategoriesStore;
