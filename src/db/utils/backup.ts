import type { SQLiteDatabase } from 'expo-sqlite';

import { SCHEMA_VERSION } from '../schema';
import { buildSqlDump } from './sql-dump';

export const BACKUP_FORMAT_VERSION = 1;
export const BACKUP_HEADER = '-- POCKETTOOL_BACKUP ';

export type BackupSettings = Record<string, string>;

export interface BackupMetadata {
  formatVersion: number;
  appVersion: string;
  schemaVersion: number;
  exportedAt: number;
  tables: string[];
  /** AsyncStorage values such as configs, language, theme and modes. */
  settings?: BackupSettings;
}

export class BackupValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupValidationError';
  }
}

export const validateBackupMetadata = (metadata: unknown): BackupMetadata => {
  if (!metadata || typeof metadata !== 'object') {
    throw new BackupValidationError('El backup no contiene metadatos válidos');
  }

  const value = metadata as Partial<BackupMetadata>;

  if (value.formatVersion !== BACKUP_FORMAT_VERSION) {
    throw new BackupValidationError(
      `Versión de formato de backup no soportada: ${String(value.formatVersion)}`
    );
  }

  if (typeof value.schemaVersion !== 'number' || value.schemaVersion > SCHEMA_VERSION) {
    throw new BackupValidationError(
      `El backup requiere un esquema más nuevo (${String(value.schemaVersion)} > ${SCHEMA_VERSION})`
    );
  }

  if (!Array.isArray(value.tables) || value.tables.length === 0) {
    throw new BackupValidationError('El backup no contiene la lista de tablas');
  }

  if (typeof value.appVersion !== 'string' || typeof value.exportedAt !== 'number') {
    throw new BackupValidationError('El backup no contiene appVersion/exportedAt válidos');
  }

  if (value.settings != null) {
    if (typeof value.settings !== 'object' || Array.isArray(value.settings)) {
      throw new BackupValidationError('Las configuraciones del backup no son válidas');
    }
    for (const [key, setting] of Object.entries(value.settings)) {
      if (typeof key !== 'string' || typeof setting !== 'string') {
        throw new BackupValidationError('Las configuraciones del backup no son válidas');
      }
    }
  }

  return value as BackupMetadata;
};

export const parseBackupMetadata = (sqlContent: string): BackupMetadata | null => {
  const firstLine = sqlContent.split(/\r?\n/, 1)[0]?.trim();
  if (!firstLine?.startsWith(BACKUP_HEADER)) return null;

  const json = firstLine.slice(BACKUP_HEADER.length);
  try {
    return validateBackupMetadata(JSON.parse(json));
  } catch (error) {
    if (error instanceof BackupValidationError) throw error;
    throw new BackupValidationError(`No se pudieron leer los metadatos del backup: ${String(error)}`);
  }
};

export const createBackupSql = async (
  db: SQLiteDatabase,
  appVersion: string,
  settings?: BackupSettings
): Promise<string> => {
  const tables = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'expo_%' ORDER BY name;"
  );

  const metadata: BackupMetadata = {
    formatVersion: BACKUP_FORMAT_VERSION,
    appVersion,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: Date.now(),
    tables: tables.map((table) => table.name),
    ...(settings && Object.keys(settings).length > 0 ? { settings } : {}),
  };

  const dump = await buildSqlDump(db);
  return `${BACKUP_HEADER}${JSON.stringify(metadata)}\n${dump}`;
};
