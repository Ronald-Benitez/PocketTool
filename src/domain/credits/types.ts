export type FinancingScheduleRow = {
  number: number;
  date: number;
  paymentCents: number;
  interestCents: number;
  principalCents: number;
  balanceCents: number;
};

export type FinancingSchedule = {
  startingBalanceCents: number;
  paymentCents: number;
  rows: FinancingScheduleRow[];
  totalInterestCents: number;
  totalPaidCents: number;
  payoffDate: number | null;
};

export type CardUtilization = {
  limitCents: number;
  usedCents: number;
  availableCents: number;
  utilizationPercent: number;
};
