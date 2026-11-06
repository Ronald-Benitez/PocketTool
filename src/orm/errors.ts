export class ORMError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ORMError';
    this.cause = cause;
  }
}

export class InvalidIdentifierError extends ORMError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidIdentifierError';
  }
}

export class InvalidDataError extends ORMError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDataError';
  }
}

export class QueryError extends ORMError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'QueryError';
  }
}
