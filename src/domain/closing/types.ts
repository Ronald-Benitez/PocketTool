export type ClosingStatus = 'draft' | 'final';

export type ClosingSection =
  | 'available'
  | 'reserve'
  | 'obligation'
  | 'resolution';

export type ClosingKind =
  | 'cash'
  | 'account'
  | 'receivable'
  | 'saving'
  | 'card'
  | 'fixed'
  | 'financing'
  | 'next_group'
  | 'manual'
  | 'adjustment';

export type ClosingOperation = 'add' | 'subtract';

export type ClosingDirection = 'from' | 'to';

export type ClosingPeriodMode =
  | 'calendar_month'
  | 'cutoff_day'
  | 'start_day'
  | 'custom_range';

export type ClosingLine = {
  id?: number;
  section: ClosingSection;
  kind: ClosingKind;
  label: string;
  operation: ClosingOperation;
  direction?: ClosingDirection | null;
  amountCents: number;
  referenceCents?: number | null;
  reason?: string | null;
  paymentMethodId?: number | null;
  savingId?: number | null;
  fixedId?: number | null;
  financingId?: number | null;
  relatedGroupId?: number | null;
  notes?: string | null;
  sortOrder: number;
};

export type ClosingLineDraft = Omit<ClosingLine, 'id'> & { id?: number };

export type ClosingPeriod = {
  start: number;
  end: number;
  editableUntil: number;
};

export type ClosingPeriodInput = {
  mode: ClosingPeriodMode;
  /** Group year. */
  groupYear: number;
  /** Zero-based group month. */
  groupMonth: number;
  cutoffDay?: number | null;
  startDay?: number | null;
  graceDays: number;
  customStart?: number | null;
  customEnd?: number | null;
  /** Optional exact deadline. Must be >= period end. */
  editableUntil?: number | null;
};

export type ClosingTotals = {
  availableCents: number;
  reserveCents: number;
  obligationsCents: number;
  resultCents: number;
  totalResolutionCents: number;
  remainingCents: number;
};

export type ClosingWarning =
  | {
      code: 'credit_card_saving_conflict';
      recordIds: number[];
    }
  | {
      code: 'period_expired';
    };

export type ClosingValidationCode =
  | 'CLOSING_INVALID_PERIOD'
  | 'CLOSING_INVALID_AMOUNT'
  | 'CLOSING_RESOLUTION_WITHOUT_RESULT'
  | 'CLOSING_RESOLUTION_MISMATCH'
  | 'CLOSING_RESOLUTION_DIRECTION_REQUIRED'
  | 'CLOSING_RESOLUTION_LIMIT_EXCEEDED'
  | 'CLOSING_EMPTY_FINAL'
  | 'CLOSING_PERIOD_EXPIRED';

export type ClosingSuggestionInput = {
  cashBalanceCents: number;
  receivableCents: number;
  includeReceivables: boolean;
  labels: {
    cash: string;
    receivable: string;
  };
  savings: {
    id?: number;
    name: string;
    ownCents: number;
  }[];
  cards: {
    id?: number;
    name: string;
    expectedCents: number;
  }[];
  fixeds: {
    id?: number;
    name: string;
    amountCents: number;
    date: number;
  }[];
  financings: {
    id?: number;
    name: string;
    amountCents: number;
    date: number;
  }[];
  conflictRecordIds?: number[];
};

export type ClosingSuggestionResult = {
  lines: ClosingLineDraft[];
  warnings: ClosingWarning[];
};
