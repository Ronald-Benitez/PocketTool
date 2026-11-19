import type {
  ClosingLine,
  ClosingStatus,
  ClosingTotals,
  ClosingValidationCode,
} from './types';
import { isClosingEditable } from './period';

const signedAmount = (line: ClosingLine) =>
  line.operation === 'subtract' ? -line.amountCents : line.amountCents;

export const calculateClosingTotals = (
  lines: readonly ClosingLine[]
): ClosingTotals => {
  let availableCents = 0;
  let reserveCents = 0;
  let obligationsCents = 0;
  let totalResolutionCents = 0;

  for (const line of lines) {
    if (line.section === 'available') {
      availableCents += signedAmount(line);
    } else if (line.section === 'reserve') {
      reserveCents += signedAmount(line);
    } else if (line.section === 'obligation') {
      obligationsCents += signedAmount(line);
    } else {
      totalResolutionCents += line.amountCents;
    }
  }

  const resultCents = availableCents - obligationsCents;
  const remainingCents = Math.abs(resultCents) - totalResolutionCents;

  return {
    availableCents,
    reserveCents,
    obligationsCents,
    resultCents,
    totalResolutionCents,
    remainingCents,
  };
};

export const cardDifferenceCents = (line: ClosingLine) =>
  line.amountCents - (line.referenceCents ?? line.amountCents);

export const isClosingBalanced = (totals: ClosingTotals) =>
  totals.remainingCents === 0;

export type ClosingValidationInput = {
  lines: readonly ClosingLine[];
  status: ClosingStatus;
  editableUntil: number;
  now?: number;
};

/**
 * Returns stable error codes that the UI can translate. Drafts may be
 * incomplete; final closings must be balanced and within their edit window.
 */
export const validateClosing = ({
  lines,
  status,
  editableUntil,
  now,
}: ClosingValidationInput): ClosingValidationCode[] => {
  const codes = new Set<ClosingValidationCode>();

  if (!isClosingEditable(editableUntil, now)) {
    codes.add('CLOSING_PERIOD_EXPIRED');
  }

  if (lines.some((line) => line.amountCents < 0)) {
    codes.add('CLOSING_INVALID_AMOUNT');
  }

  const totals = calculateClosingTotals(lines);
  const resolutionLines = lines.filter(
    (line) => line.section === 'resolution'
  );

  if (
    resolutionLines.some((line) => line.direction == null)
  ) {
    codes.add('CLOSING_RESOLUTION_DIRECTION_REQUIRED');
  }

  if (
    resolutionLines.some(
      (line) =>
        line.referenceCents != null &&
        line.amountCents > line.referenceCents
    )
  ) {
    codes.add('CLOSING_RESOLUTION_LIMIT_EXCEEDED');
  }

  if (totals.resultCents === 0 && resolutionLines.length > 0) {
    codes.add('CLOSING_RESOLUTION_WITHOUT_RESULT');
  }

  if (status === 'final') {
    if (lines.length === 0) codes.add('CLOSING_EMPTY_FINAL');
    if (totals.remainingCents !== 0) {
      codes.add('CLOSING_RESOLUTION_MISMATCH');
    }
  }

  return [...codes];
};
