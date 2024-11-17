import { useSQLiteContext } from "expo-sqlite";

import { Category, CreateCategoryRequest } from "@/src/interfaces";

export const useCategories = () => {
  const db = useSQLiteContext();

  const fetchCategories = async (): Promise<Category[]> => {
    try {
      return (await db.getAllAsync("SELECT * FROM Categories")) as Category[];
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const fetchCategoriesByID = async (id: number): Promise<Category[]> => {
    try {
      return (await db.getAllAsync(`SELECT * FROM Categories `)) as Category[];
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const addCategory = async (category: CreateCategoryRequest) => {
    try {
      await db.runAsync(
        `
            INSERT INTO Categories (category_name) VALUES (?)`,
        category.category_name
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await db.runAsync("DELETE FROM Categories WHERE id = ?", id);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateCategory = async (
    id: number,
    category: CreateCategoryRequest
  ) => {
    try {
      await db.runAsync(
        `
            UPDATE Categories SET category_name = ? WHERE id = ?`,
        category.category_name,
        id
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    addCategory,
    deleteCategory,
    fetchCategories,
    updateCategory,
  };
};
