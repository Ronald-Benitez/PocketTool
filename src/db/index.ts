export {
  useTableRepository,
  useRecordsRepository,
  useFixedsRepository,
  useGroupsRepository,
  useCategoriesRepository,
  useSavingsRepository,
  useSavingsHistoryRepository,
  useBudgetsRepository,
  usePaymentMethodsRepository,
} from './repositories';

export { useRecordsRepository as useRecords } from './repositories';
export { useFixedsRepository as useFixeds } from './repositories';
export { useGroupsRepository as useGroups } from './repositories';
export { useCategoriesRepository as useCategories } from './repositories';
export { useSavingsRepository as useSavings } from './repositories';
export { useSavingsHistoryRepository as useSavingsHistory } from './repositories';
export { useBudgetsRepository as useBudget } from './repositories';
export { useBudgetsRepository as useBudgets } from './repositories';
export { usePaymentMethodsRepository as usePaymentMethods } from './repositories';

export interface ResumeTotalsBudget {
  transferTotal: number | null;
  expensesTotal: number | null;
  incomesTotal: number | null;
  balance: number;
}

export interface ResumeByCreditCards {
  creditCardName: string;
  closingDate: number;
  current: number;
  previous: number;
}
