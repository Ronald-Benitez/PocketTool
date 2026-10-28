import type { SQLiteDatabase } from 'expo-sqlite';

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}

/**
 * Incremental migrations that run after the normalized baseline schema.
 *
 * The baseline itself is handled by `src/db/migration.ts` because it must
 * rebuild legacy PascalCase tables and convert money/dates in place.
 */
export const migrations: Migration[] = [];
