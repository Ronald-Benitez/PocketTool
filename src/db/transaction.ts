import type { SQLiteDatabase } from 'expo-sqlite';

export type TransactionDatabase = SQLiteDatabase;

const isWeb = () => typeof document !== 'undefined';

/**
 * Run `task` in a transaction. On native we use SQLite's exclusive transaction
 * so no other async query can interleave. Expo SQLite does not support
 * `withExclusiveTransactionAsync` on web, so there we fall back to a regular
 * transaction.
 */
export const withExclusiveTransaction = async <T>(
  db: SQLiteDatabase,
  task: (txn: TransactionDatabase) => Promise<T>
): Promise<T> => {
  let result!: T;

  if (isWeb() || typeof db.withExclusiveTransactionAsync !== 'function') {
    await db.withTransactionAsync(async () => {
      result = await task(db);
    });
    return result;
  }

  await db.withExclusiveTransactionAsync(async (txn) => {
    result = await task(txn);
  });
  return result;
};
