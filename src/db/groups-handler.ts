// src/database.ts
import { Group, CreateGroupRequest } from "@/src/interfaces";
import { useSQLiteContext } from "expo-sqlite";

export const useGroups = () => {
  const db = useSQLiteContext();
  // Obtener todos los grupos
  const fetchGroups = async (): Promise<Group[]> => {
    try {
      return (await db.getAllAsync("SELECT * FROM Groups")) as Group[];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // Obtener grupos por año
  const fetchGroupsByYear = async (year: string): Promise<Group[]> => {
    try {
      return (await db.getAllAsync("SELECT * FROM Groups WHERE year = ?", [
        year,
      ])) as Group[];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // Obtener grupos por año
  const fetchGroupsById = async (id: number): Promise<Group|[]> => {
    try {
      const result = await db.getAllAsync("SELECT * FROM Groups WHERE id = ?", [
        id,
      ])
      return result[0] as Group
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const fetchLastGroup = async (): Promise<Group | []> => {
    try {
        const result = await db.getAllAsync("SELECT * FROM Groups ORDER BY id DESC LIMIT 1");
        return result[0] as Group;
    } catch (error) {
        console.error(error);
        return [];
    }
};


  // Agregar un nuevo grupo
  const addGroup = async (newGroup: CreateGroupRequest) => {
    try {
      await db.runAsync(
        `
            INSERT INTO Groups (group_name, goal, year, month) VALUES (?, ?, ?, ?)`,
        newGroup.group_name,
        newGroup.goal,
        newGroup.year,
        newGroup.month
      );
    } catch (error) {
      console.error(error);
    }
  };

  // Eliminar un grupo
  const deleteGroup = async (id: number) => {
    try {
      await db.runAsync("DELETE FROM Groups WHERE id = ?", id);
    } catch (error) {
      console.error(error);
    }
  };

  // Editar un grupo
  const editGroup = async (
    id: number,
    updatedGroup: CreateGroupRequest
  ) => {
    try {
      await db.runAsync(
        `
            UPDATE Groups 
            SET group_name = ?, goal = ?, year = ?, month = ? 
            WHERE id = ?`,
        updatedGroup.group_name,
        updatedGroup.goal,
        updatedGroup.year,
        updatedGroup.month,
        id
      );
    } catch (error) {
      console.error(error);
    }
  };

  return {
    addGroup,
    deleteGroup,
    editGroup,
    fetchGroups,
    fetchGroupsByYear,
    fetchGroupsById,
    fetchLastGroup
  }
};
