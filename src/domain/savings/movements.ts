export type SavingRecordMatchInput = {
  recordAmount: number;
  recordDate: number;
  amount: number;
  date: number;
};

export type SavingRecordMatchError =
  | 'RECORD_AMOUNT_MISMATCH'
  | 'RECORD_DATE_MISMATCH'
  | null;

export const validateSavingRecordMatch = ({
  recordAmount,
  recordDate,
  amount,
  date,
}: SavingRecordMatchInput): SavingRecordMatchError => {
  if (recordAmount !== amount) return 'RECORD_AMOUNT_MISMATCH';
  const record = new Date(recordDate);
  const movement = new Date(date);
  const sameDay =
    record.getFullYear() === movement.getFullYear() &&
    record.getMonth() === movement.getMonth() &&
    record.getDate() === movement.getDate();
  return sameDay ? null : 'RECORD_DATE_MISMATCH';
};
