export type DatabaseErrorCode =
  | 'DB_MIGRATION_REQUIRED'
  | 'DB_DUPLICATE'
  | 'DB_REQUIRED'
  | 'DB_FOREIGN_KEY'
  | 'DB_UNKNOWN';

export class DatabaseMappedError extends Error {
  readonly code: DatabaseErrorCode;
  readonly cause?: unknown;

  constructor(code: DatabaseErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'DatabaseMappedError';
    this.code = code;
    this.cause = cause;
  }
}

export const mapDatabaseError = (
  error: unknown,
  fallbackMessage = 'Database operation failed'
): DatabaseMappedError => {
  if (error instanceof DatabaseMappedError) return error;
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (
    normalized.includes('no such table') ||
    normalized.includes('no such column') ||
    normalized.includes('has no column named')
  ) {
    return new DatabaseMappedError(
      'DB_MIGRATION_REQUIRED',
      message,
      error
    );
  }
  if (
    normalized.includes('unique constraint') ||
    normalized.includes('constraint failed: unique')
  ) {
    return new DatabaseMappedError('DB_DUPLICATE', message, error);
  }
  if (
    normalized.includes('not null constraint') ||
    normalized.includes('constraint failed: not null')
  ) {
    return new DatabaseMappedError('DB_REQUIRED', message, error);
  }
  if (
    normalized.includes('foreign key constraint') ||
    normalized.includes('constraint failed: foreign key')
  ) {
    return new DatabaseMappedError('DB_FOREIGN_KEY', message, error);
  }

  return new DatabaseMappedError('DB_UNKNOWN', fallbackMessage, error);
};
