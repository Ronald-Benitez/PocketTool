export {
  useTableRepository,
  useRecordsRepository,
  useFixedsRepository,
  useGroupsRepository,
  useCategoriesRepository,
  useSavingsRepository,
  useSavingsHistoryRepository,
  useBudgetPlansRepository,
  useBudgetTemplatesRepository,
  usePaymentMethodsRepository,
  usePaidCreditsRepository,
  useVehiclesRepository,
  useVehicleFuelRepository,
  useVehicleMaintenanceRepository,
  useVehicleRemindersRepository,
  useVehicleSettingsRepository,
  useVehicleExpenseLinksRepository,
} from './repositories';

export { useRecordsRepository as useRecords } from './repositories';
export { useFixedsRepository as useFixeds } from './repositories';
export { useGroupsRepository as useGroups } from './repositories';
export { useCategoriesRepository as useCategories } from './repositories';
export { useSavingsRepository as useSavings } from './repositories';
export { useSavingsHistoryRepository as useSavingsHistory } from './repositories';
export { useBudgetPlansRepository as useBudgetPlans } from './repositories';
export { useBudgetTemplatesRepository as useBudgetTemplates } from './repositories';
export { usePaymentMethodsRepository as usePaymentMethods } from './repositories';
export { usePaidCreditsRepository as usePaidCredits } from './repositories';


export interface ResumeByCreditCards {
  creditCardName: string;
  closingDate: number;
  current: number;
  previous: number;
}
