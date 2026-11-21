import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';
import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import migrateDb from '@/src/db/migration';
import { withExclusiveTransaction } from '@/src/db/transaction';
import { useFeatures } from '@/src/features';
import { useBalanceMode } from '@/src/hooks/useBalanceMode';
import { useRecordDefaults } from '@/src/hooks/useRecordDefaults';
import { useConfigs } from '@/src/hooks/useConfigs';
import { useSummaryMode } from '@/src/hooks/useSummaryMode';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import {
  createBackupSql,
  parseBackupMetadata,
  type BackupSettings,
} from './backup';
import { validateSqlDump } from './sql-dump';

const appVersion = () => Constants.expoConfig?.version ?? 'unknown';

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

const collectSettings = async (): Promise<BackupSettings> => {
  const keys = await AsyncStorage.getAllKeys();
  if (keys.length === 0) return {};
  const pairs = await AsyncStorage.multiGet(keys);
  return Object.fromEntries(
    pairs.filter((entry): entry is [string, string] => entry[1] != null)
  );
};

const applySettings = async (settings?: BackupSettings) => {
  if (!settings || Object.keys(settings).length === 0) return;
  await AsyncStorage.multiSet(Object.entries(settings));
  await useConfigs.getState().loadConfigs();
  await useSummaryMode.getState().load();
  await useBalanceMode.getState().load();
  await useFeatures.getState().reload();
  await useRecordDefaults.getState().reload();
};

const createBackup = async (db: SQLite.SQLiteDatabase): Promise<string> => {
  const settings = await collectSettings();
  const sqlDump = await createBackupSql(db, appVersion(), settings);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = writeDumpFile(`backup-before-import-${timestamp}.sql`, sqlDump);
  return file.uri;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const useDBExport = function () {
  const db = SQLite.useSQLiteContext();
  const { showToast } = useToast();

  const exportDatabase = async () => {
    try {
      const settings = await collectSettings();
      const sqlDump = await createBackupSql(db, appVersion(), settings);
      const dumpFile = writeDumpFile('backup.sql', sqlDump);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(dumpFile.uri);
        showToast({ message: 'Exportación lista', type: 'success' });
      } else {
        showToast({
          title: 'Exportación lista',
          message: dumpFile.uri,
          type: 'success',
          duration: 6000,
        });
      }
    } catch (error) {
      console.error('Error detallado en dump:', error);
      showToast({
        title: 'Error al exportar',
        message: getErrorMessage(error),
        type: 'error',
        duration: 6000,
      });
    }
  };

  const importDatabase = async () => {
    let backupUri: string | null = null;

    try {
      const sqlContent = await pickSqlFile();
      if (sqlContent === null) return;

      // JSON metadata is optional for backwards compatibility with SQL dumps.
      const metadata = parseBackupMetadata(sqlContent);
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

      // Restore app settings (record type selection, modes, language, theme,
      // etc.). Old backups without settings remain valid.
      await applySettings(metadata?.settings);

      showToast({
        title: 'Importación exitosa',
        message: backupUri
          ? `Los datos y las configuraciones han sido restaurados.\nSi el idioma o el tema no cambian, reinicia la app.\nBackup previo:\n${backupUri}`
          : 'Los datos y las configuraciones han sido restaurados.',
        type: 'success',
        duration: 7000,
      });
    } catch (error) {
      console.error('Error detallado en importación:', error);
      showToast({
        title: 'Error al importar',
        message: `${getErrorMessage(error)}${backupUri ? `\nBackup previo:\n${backupUri}` : ''}`,
        type: 'error',
        duration: 7000,
      });
    }
  };

  return {
    exportDatabase,
    importDatabase,
  };
};
