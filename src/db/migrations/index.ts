import type { SQLiteDatabase } from 'expo-sqlite';

import baseline from './0001_baseline';
import auditTimestamps from './0002_audit_timestamps';

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}

/**
 * Migrations are the single source of schema evolution after the baseline.
 * `0001_baseline` creates the consolidated schema; later migrations only alter.
 */
export const migrations: Migration[] = [baseline, auditTimestamps];
