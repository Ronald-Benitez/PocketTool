import { useSQLiteContext } from "expo-sqlite";
import { Savings } from "@/src/interfaces";

export const useSavings = () => {
  const db = useSQLiteContext();

  // Obtener todos los registros de Savings
  const fetchSavings = async (): Promise<Savings[]> => {
    try {
      const result = (await db.getAllAsync(
        "SELECT * FROM Savings"
      )) as Savings[];
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Agregar un nuevo registro de Savings
  const addSavings = async (savingName: string, amount: number) => {
    try {
      await db.runAsync(
        `INSERT INTO Savings (saving_name, amount) VALUES (?, ?)`,
        savingName,
        amount
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Actualizar un registro de Savings por su id
  const updateSavings = async (id: number, savingName: string, amount: number) => {
    try {
      await db.runAsync(
        `UPDATE Savings 
         SET saving_name = ?, amount = ? 
         WHERE id = ?`,
        savingName,
        amount,
        id
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Eliminar un registro de Savings por su id
  const deleteSavings = async (id: number) => {
    try {
      await db.runAsync("DELETE FROM Savings WHERE id = ?", id);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const fetchSavingsById = async (id: number): Promise<Savings|[]> => {
    try {
      const result = await db.getAllAsync("SELECT * FROM Savings WHERE id = ?", [
        id,
      ])
      return result[0] as Savings
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  return {
    fetchSavings,
    addSavings,
    updateSavings,
    deleteSavings,
    fetchSavingsById
  };
};
