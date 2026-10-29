import type { SQLiteDatabase } from 'expo-sqlite';

export type TransactionDatabase = SQLiteDatabase;

const isWeb = () => typeof document !== 'undefined';

/**
 * Run `task` in a transaction. On native we use SQLite's exclusive transaction
 * so no other async query can interleave. Expo SQLite does not support
 * `withExclusiveTransactionAsync` on web, so there we fall back to a regular
 * transaction.
 */
export const withExclusiveTransaction = async (
  db: SQLiteDatabase,
  task: (txn: TransactionDatabase) => Promise<void>
): Promise<void> => {
  if (isWeb() || typeof db.withExclusiveTransactionAsync !== 'function') {
    await db.withTransactionAsync(() => task(db));
    return;
  }

  await db.withExclusiveTransactionAsync((txn) => task(txn));
};
