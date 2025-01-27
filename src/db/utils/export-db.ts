import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as SQLite from "expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { ToastAndroid } from "react-native";

export const exportDatabaseToSQLFile = async (
  db: SQLite.SQLiteDatabase,
  t: any
) => {
  try {
    // Array para almacenar las consultas de exportación
    let exportSQL = [];

    // Agregar las instrucciones DELETE para cada tabla
    exportSQL.push("DELETE FROM Records;");
    exportSQL.push("DELETE FROM Groups;");
    exportSQL.push("DELETE FROM PaymentMethods;");
    exportSQL.push("DELETE FROM Categories;");
    exportSQL.push("DELETE FROM Savings;");
    exportSQL.push("DELETE FROM SavingsHistory;");
    exportSQL.push("DELETE FROM Budgets;");
    exportSQL.push("DELETE FROM Migrations;");

    // Función para agregar consultas INSERT
    const addInsertStatements = (tableName: string, rows: any[]) => {
      rows.forEach((row) => {
        const columns = Object.keys(row).join(", ");
        const values = Object.values(row)
          .map((value) =>
            typeof value === "string" ? `'${value.replace(/'/g, "''")}'` : value
          )
          .join(", ");

        exportSQL.push(
          `INSERT INTO ${tableName} (${columns}) VALUES (${values});`
        );
      });
    };

    // Consultar y agregar datos de cada tabla usando execAsync
    const tables = [
      "Records",
      "Groups",
      "PaymentMethods",
      "Categories",
      "Savings",
      "SavingsHistory",
      "Migrations",
      "Budgets",
    ];
    for (const table of tables) {
      const result = await db.getAllAsync(`SELECT * FROM ${table}`);
      if (result) {
        addInsertStatements(table, result);
      }
    }

    // Convertir el array de consultas a una cadena de texto
    const sqlContent = exportSQL.join("\n");

    const now = new Date().toISOString();
    // Guardar el archivo en el sistema de archivos
    const fileUri = `${FileSystem.documentDirectory}PocketBackup(${now}).sql`;
    const res = await FileSystem.writeAsStringAsync(fileUri, sqlContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Compartir el archivo con el usuario
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      console.log(
        "La función de compartir no está disponible en esta plataforma"
      );
      ToastAndroid.show(t('db.noSharing') , ToastAndroid.SHORT);
    }

    console.log("Exportación completada con éxito", res);
    ToastAndroid.show(t('db.exportSucces') , ToastAndroid.SHORT);
  } catch (error) {
    console.error("Error al exportar la base de datos:", error);
    ToastAndroid.show(t('db.exportError') , ToastAndroid.SHORT);
  }
};
