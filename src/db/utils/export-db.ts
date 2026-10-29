import * as SQLite from 'expo-sqlite';
import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

import migrateDb from '@/src/db/migration';
import { withExclusiveTransaction } from '@/src/db/transaction';
import { buildSqlDump, validateSqlDump } from './sql-dump';

const writeDumpFile = (fileName: string, sqlDump: string): File => {
  const cacheDir = Paths.cache.uri;
  const separator = cacheDir.endsWith('/') ? '' : '/';
  const file = new File(`${cacheDir}${separator}${fileName}`);

  file.write(sqlDump);
  return file;
};

const pickSqlFile = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/x-sql', 'text/plain'],
    });

    if (result.canceled || !result.assets) return null;

    const selectedFile = result.assets[0].file;
    if (!selectedFile) throw new Error('No se pudo leer el archivo seleccionado');

    return selectedFile.text();
  }

  const result = await File.pickFileAsync({
    mimeTypes: ['application/x-sql', 'text/plain'],
  });

  if (result.canceled) return null;
  return result.result.text();
};

const createBackup = async (db: SQLite.SQLiteDatabase): Promise<string> => {
  const sqlDump = await buildSqlDump(db);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = writeDumpFile(`backup-before-import-${timestamp}.sql`, sqlDump);
  return file.uri;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const useDBExport = function () {
  const db = SQLite.useSQLiteContext();

  const exportDatabase = async () => {
    try {
      const sqlDump = await buildSqlDump(db);
      const dumpFile = writeDumpFile('backup.sql', sqlDump);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(dumpFile.uri);
      } else {
        Alert.alert('Exportación lista', dumpFile.uri);
      }
    } catch (error) {
      console.error('Error detallado en dump:', error);
      Alert.alert('Error al exportar', getErrorMessage(error));
    }
  };

  const importDatabase = async () => {
    let backupUri: string | null = null;

    try {
      const sqlContent = await pickSqlFile();
      if (sqlContent === null) return;

      validateSqlDump(sqlContent);

      // Keep a restorable copy before touching the current database.
      backupUri = await createBackup(db);

      await db.execAsync('PRAGMA foreign_keys = OFF;');
      try {
        await withExclusiveTransaction(db, async (txn) => {
          const tables = await txn.getAllAsync<{ name: string }>(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'expo_%';"
          );

          for (const table of tables) {
            await txn.execAsync(`DROP TABLE IF EXISTS "${table.name}";`);
          }

          await txn.execAsync(sqlContent);
        });
      } finally {
        await db.execAsync('PRAGMA foreign_keys = ON;');
      }

      // Normalize legacy dumps and create any missing canonical tables.
      await migrateDb(db);

      Alert.alert(
        'Importación exitosa',
        `Los datos han sido restaurados.\n\nBackup previo:\n${backupUri}`
      );
    } catch (error) {
      console.error('Error detallado en importación:', error);
      Alert.alert(
        'Error al importar',
        `${getErrorMessage(error)}${backupUri ? `\n\nBackup previo:\n${backupUri}` : ''}`
      );
    }
  };

  return {
    exportDatabase,
    importDatabase,
  };
};
