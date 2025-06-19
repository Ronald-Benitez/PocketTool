import { useSQLiteContext } from "expo-sqlite";
import { Records, Budgets, Categories, Groups, Migrations, PaymentMethods, PaymentTypes, RecordJoined, RecordTypes, Savings, SavingsHistory } from "../types/tables";

export type TableType = {
    Groups: Groups;
    Budgets: Budgets;
    Categories: Categories;
    PaymentTypes: PaymentTypes;
    PaymentMethods: PaymentMethods;
    Records: Records;
    Savings: Savings;
    SavingsHistory: SavingsHistory;
    RecordTypes: RecordTypes;
    Migrations: Migrations;
};

export type Table = keyof TableType;

export const useHandler = (table: Table) => {
    const db = useSQLiteContext();
    type TableSchema = TableType[Table];

    const fetchAll = async (newTable = table): Promise<TableSchema[]> => {
        try {
            return (await db.getAllAsync(`SELECT * FROM ${newTable}`)) as TableSchema[];
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const fetchAllWithJoin = async (joinTable: Table, joinColumn: string): Promise<any[]> => {
        try {
            return (await db.getAllAsync(`
                SELECT 
                ${joinTable}.id AS ${joinColumn}_id,
                *
                FROM ${table} 
                INNER JOIN ${joinTable} ON ${table}.${joinColumn} = ${joinTable}.id
                `)) as any[];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    const fetchWithWhere = async (column: string, value: string): Promise<TableSchema[]> => {
        try {
            return (await db.getAllAsync(`SELECT * FROM ${table} WHERE ${column} = ?`, [value])) as TableSchema[];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    const fetchGroupsByYear = async (year: string): Promise<TableSchema[]> => {
        try {
            return (await db.getAllAsync("SELECT * FROM Groups WHERE year = ?", [
                year,
            ])) as TableSchema[];
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const fetchById = async (id: number): Promise<TableSchema | []> => {
        try {
            const result = await db.getAllAsync(`SELECT * FROM ${table} WHERE id = ?`, [
                id,
            ])
            return result[0] as TableSchema
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const fetchLast = async (): Promise<TableSchema | []> => {
        try {
            const result = await db.getAllAsync(`SELECT * FROM ${table} ORDER BY id DESC LIMIT 1`);
            console.log(`SELECT * FROM ${table} ORDER BY id DESC LIMIT 1`, result);
            return result[0] as TableSchema;
        } catch (error) {
            console.error(error);
            return [];
        }
    };


    const add = async (values: Record<string, any>) => {
        let columnsList = "("
        let valuesList = "("
        const keys = Object.keys(values)
        const length = keys.length
        const newValues = Object.fromEntries(
            keys.map((key: string) => [`$${key}`, values[key]])
        );
        keys.map((key, index) => {
            columnsList += key
            valuesList += `$${key}`
            if (index < length - 1) {
                columnsList += ", "
                valuesList += ", "
            } else {
                columnsList += ") "
                valuesList += ") "
            }
        })

        try {
            await db.runAsync(`INSERT INTO ${table} ${columnsList} VALUES ${valuesList}`, newValues);
        } catch (error) {
            console.error(error);
        }
    };

    const edit = async (values: Record<string, any>) => {
        let columnsList = ""
        const keys = Object.keys(values)
        const length = keys.length
        const newValues = Object.fromEntries(
            keys.map((key: string) => [`$${key}`, values[key]])
        );

        keys.map((key, index) => {
            columnsList += ` ${key} = $${key}`
            if (index < length - 1) {
                columnsList += ", "
            } else {
                columnsList += " "
            }
        })
        console.log(`UPDATE ${table} SET ${columnsList} WHERE id = $id`, newValues);

        try {
            await db.runAsync(`UPDATE ${table} SET ${columnsList} WHERE id = $id`, newValues);
        } catch (error) {
            console.error(error);
        }
    };

    const deleteById = async (id: number) => {
        try {
            await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, id);
        } catch (error) {
            console.error(error);
        }
    };

    const deleteWithWhere = async (column: string, value: string) => {
         try {
            await db.runAsync(`DELETE FROM ${table} WHERE ${column} = ?`, value);
        } catch (error) {
            console.error(error);
        }
    }

    return {
        fetchAll,
        fetchAllWithJoin,
        fetchWithWhere,
        fetchById,
        fetchLast,
        deleteById,
        deleteWithWhere,
        add,
        edit,
        fetchGroupsByYear,
    }
};
