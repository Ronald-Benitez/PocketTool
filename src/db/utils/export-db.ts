import * as SQLite from 'expo-sqlite';
import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

export const useDBExport = function () {
  const db = SQLite.useSQLiteContext();

  const exportDatabase = async () => {
    console.log("Hola ------------------")
    let sqlDump = "";
  
    try {
      const tables = await db.getAllAsync<{ name: string; sql: string }>(
        "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'expo_%';"
      );
  
      for (const table of tables) {
        if (!table.sql) continue;
  
        sqlDump += `-- Tabla: ${table.name}\n`;
        sqlDump += `${table.sql};\n`;
  
        const rows = await db.getAllAsync<any>(`SELECT * FROM "${table.name}";`);
  
        for (const row of rows) {
          const columns = Object.keys(row).map(col => `"${col}"`).join(', ');
          const values = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'number') return val;
            return `'${String(val).replace(/'/g, "''")}'`;
          }).join(', ');
  
          sqlDump += `INSERT INTO "${table.name}" (${columns}) VALUES (${values});\n`;
        }
        sqlDump += "\n";
      }
  
      console.log(sqlDump)
  
      const cacheDir = Paths.cache.uri;
      const separator = cacheDir.endsWith('/') ? '' : '/';
      const fullUri = `${cacheDir}${separator}backup.sql`;
  
      const dumpFile = new File(fullUri);
      
      dumpFile.write(sqlDump);
  
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(dumpFile.uri);
      }
    } catch (error) {
      console.error("Error detallado en dump:", error);
    }
  };

  const importDatabase = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/x-sql', 'text/plain'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets) return;

    const selectedFileUri = result.assets[0].uri;
    const fileToImport = new File(selectedFileUri);
    const sqlContent = await fileToImport.text();

    if (!sqlContent) throw new Error("El archivo está vacío");

    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'expo_%';"
    );

    console.log("Limpiando base de datos...");
    
    await db.execAsync("PRAGMA foreign_keys = OFF;");
    for (const table of tables) {
      await db.execAsync(`DROP TABLE IF EXISTS "${table.name}";`);
    }

    console.log("Insertando nuevos datos...");
    await db.execAsync(sqlContent);
    
    await db.execAsync("PRAGMA foreign_keys = ON;");

    alert("Importación exitosa. Los datos han sido restaurados.");
    
  } catch (error) {
    console.error("Error detallado en importación:", error);
    try { await db.execAsync("ROLLBACK;"); } catch (e) { /* ignore */ }
    alert("Error al importar: " + error);
  }

};

  return{
    exportDatabase,
    importDatabase
  }
}
