import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { RecordType } from '@/src/interfaces/schema';
import type { PendingPaymentDateMode } from '@/src/domain/credits/pending';
import type {
    FixedPendingDateMode,
    FixedPendingDedupeMode,
} from '@/src/domain/records/fixedPending';
import type { ClosingPeriodMode } from '@/src/domain/closing/types';
import type { GroupPeriodMode } from '@/src/domain/groups/types';

export interface Configs {
    recordTypes: number[];
    creditType: number;
    paymentCreditType: number;
    pendingPaymentDateMode: PendingPaymentDateMode;
    pendingFixedDateMode: FixedPendingDateMode;
    pendingFixedDedupeMode: FixedPendingDedupeMode;
    groupAutoCreate: boolean;
    groupPeriodMode: GroupPeriodMode;
    groupStartDay: number;
    /** @deprecated Period settings moved to the group configuration. */
    closingPeriodMode: ClosingPeriodMode;
    /** @deprecated Use `groupStartDay`. */
    closingCutoffDay: number;
    /** @deprecated Use `groupStartDay`. */
    closingStartDay: number;
    closingGraceDays: number;
    closingAllowPeriodOverride: boolean;
}

const DEFAULT_RECORD_TYPES = ['Income', 'Expense'];
const DEFAULT_CREDIT_TYPE = 'Credit expenses';
const DEFAULT_PAYMENT_CREDIT_TYPE = 'Payments';
const DEFAULT_PENDING_PAYMENT_DATE_MODE: PendingPaymentDateMode = 'today';
const DEFAULT_PENDING_FIXED_DATE_MODE: FixedPendingDateMode = 'next_occurrence';
const DEFAULT_PENDING_FIXED_DEDUPE_MODE: FixedPendingDedupeMode = 'period';
const DEFAULT_GROUP_AUTO_CREATE = false;
const DEFAULT_GROUP_PERIOD_MODE: GroupPeriodMode = 'calendar_month';
const DEFAULT_GROUP_START_DAY = 1;
const DEFAULT_CLOSING_PERIOD_MODE: ClosingPeriodMode = 'calendar_month';
const DEFAULT_CLOSING_CUTOFF_DAY = 31;
const DEFAULT_CLOSING_START_DAY = 1;
const DEFAULT_CLOSING_GRACE_DAYS = 5;
const DEFAULT_CLOSING_ALLOW_PERIOD_OVERRIDE = true;

const isPendingPaymentDateMode = (
    value: unknown
): value is PendingPaymentDateMode =>
    value === 'today' ||
    value === 'payment_date' ||
    value === 'next_payment_date';

const isPendingFixedDateMode = (
    value: unknown
): value is FixedPendingDateMode =>
    value === 'group_month' || value === 'next_occurrence';

const isPendingFixedDedupeMode = (
    value: unknown
): value is FixedPendingDedupeMode =>
    value === 'group' || value === 'period';

const isClosingPeriodMode = (value: unknown): value is ClosingPeriodMode =>
    value === 'calendar_month' ||
    value === 'cutoff_day' ||
    value === 'start_day' ||
    value === 'custom_range';

const isGroupPeriodMode = (value: unknown): value is GroupPeriodMode =>
    value === 'calendar_month' || value === 'start_day';

const isGroupStartDay = (value: unknown): value is number =>
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 31;

/**
 * Legacy closings configured a start/cutoff day. The new shared period keeps a
 * single start day. A cutoff of 31 is equivalent to starting on day 1.
 */
const migrateLegacyGroupPeriod = (
    parsed: Partial<Configs>,
    defaults: Configs
): { mode: GroupPeriodMode; startDay: number } => {
    if (isGroupPeriodMode(parsed.groupPeriodMode)) {
        return {
            mode: parsed.groupPeriodMode,
            startDay: isGroupStartDay(parsed.groupStartDay)
                ? parsed.groupStartDay
                : defaults.groupStartDay,
        };
    }

    if (isClosingPeriodMode(parsed.closingPeriodMode)) {
        if (parsed.closingPeriodMode === 'start_day') {
            return {
                mode: 'start_day',
                startDay: isClosingDay(parsed.closingStartDay)
                    ? parsed.closingStartDay
                    : defaults.groupStartDay,
            };
        }
        if (parsed.closingPeriodMode === 'cutoff_day') {
            const cutoff = isClosingDay(parsed.closingCutoffDay)
                ? parsed.closingCutoffDay
                : DEFAULT_CLOSING_CUTOFF_DAY;
            return {
                mode: 'start_day',
                startDay: cutoff >= 31 ? 1 : cutoff + 1,
            };
        }
    }

    return { mode: defaults.groupPeriodMode, startDay: defaults.groupStartDay };
};

const isClosingDay = (value: unknown): value is number =>
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 31;

const isClosingGraceDays = (value: unknown): value is number =>
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 31;

const isBoolean = (value: unknown): value is boolean =>
    typeof value === 'boolean';

/**
 * Resolve the default configuration by stable record-type names instead of
 * hardcoded IDs. IDs can change when a database is restored or re-seeded.
 */
export const resolveDefaultConfigs = (recordTypes: RecordType[]): Configs => {
    const byName = new Map(
        recordTypes
            .filter((type) => type.type_name && type.id !== undefined)
            .map((type) => [type.type_name!.toLowerCase(), type.id as number])
    );

    const idFor = (name: string) => byName.get(name.toLowerCase()) ?? 0;

    return {
        recordTypes: DEFAULT_RECORD_TYPES
            .map(idFor)
            .filter((id) => id > 0),
        creditType: idFor(DEFAULT_CREDIT_TYPE),
        paymentCreditType: idFor(DEFAULT_PAYMENT_CREDIT_TYPE),
        pendingPaymentDateMode: DEFAULT_PENDING_PAYMENT_DATE_MODE,
        pendingFixedDateMode: DEFAULT_PENDING_FIXED_DATE_MODE,
        pendingFixedDedupeMode: DEFAULT_PENDING_FIXED_DEDUPE_MODE,
        groupAutoCreate: DEFAULT_GROUP_AUTO_CREATE,
        groupPeriodMode: DEFAULT_GROUP_PERIOD_MODE,
        groupStartDay: DEFAULT_GROUP_START_DAY,
        closingPeriodMode: DEFAULT_CLOSING_PERIOD_MODE,
        closingCutoffDay: DEFAULT_CLOSING_CUTOFF_DAY,
        closingStartDay: DEFAULT_CLOSING_START_DAY,
        closingGraceDays: DEFAULT_CLOSING_GRACE_DAYS,
        closingAllowPeriodOverride: DEFAULT_CLOSING_ALLOW_PERIOD_OVERRIDE,
    };
};

interface ConfigsStore {
    configs: Configs;
    loadConfigs: (recordTypes?: RecordType[]) => Promise<void>;
    saveConfigs: (newConfigs: Configs) => Promise<void>;
}

export const useConfigs = create<ConfigsStore>((set) => ({
    configs: {
        recordTypes: [],
        creditType: 0,
        paymentCreditType: 0,
        pendingPaymentDateMode: DEFAULT_PENDING_PAYMENT_DATE_MODE,
        pendingFixedDateMode: DEFAULT_PENDING_FIXED_DATE_MODE,
        pendingFixedDedupeMode: DEFAULT_PENDING_FIXED_DEDUPE_MODE,
        groupAutoCreate: DEFAULT_GROUP_AUTO_CREATE,
        groupPeriodMode: DEFAULT_GROUP_PERIOD_MODE,
        groupStartDay: DEFAULT_GROUP_START_DAY,
        closingPeriodMode: DEFAULT_CLOSING_PERIOD_MODE,
        closingCutoffDay: DEFAULT_CLOSING_CUTOFF_DAY,
        closingStartDay: DEFAULT_CLOSING_START_DAY,
        closingGraceDays: DEFAULT_CLOSING_GRACE_DAYS,
        closingAllowPeriodOverride: DEFAULT_CLOSING_ALLOW_PERIOD_OVERRIDE,
    },

    loadConfigs: async (recordTypes) => {
        try {
            const defaults = recordTypes?.length
                ? resolveDefaultConfigs(recordTypes)
                : {
                    recordTypes: [],
                    creditType: 0,
                    paymentCreditType: 0,
                    pendingPaymentDateMode: DEFAULT_PENDING_PAYMENT_DATE_MODE,
                    pendingFixedDateMode: DEFAULT_PENDING_FIXED_DATE_MODE,
                    pendingFixedDedupeMode: DEFAULT_PENDING_FIXED_DEDUPE_MODE,
                    groupAutoCreate: DEFAULT_GROUP_AUTO_CREATE,
                    groupPeriodMode: DEFAULT_GROUP_PERIOD_MODE,
                    groupStartDay: DEFAULT_GROUP_START_DAY,
                    closingPeriodMode: DEFAULT_CLOSING_PERIOD_MODE,
                    closingCutoffDay: DEFAULT_CLOSING_CUTOFF_DAY,
                    closingStartDay: DEFAULT_CLOSING_START_DAY,
                    closingGraceDays: DEFAULT_CLOSING_GRACE_DAYS,
                    closingAllowPeriodOverride: DEFAULT_CLOSING_ALLOW_PERIOD_OVERRIDE,
                };

            const storedConfigs = await AsyncStorage.getItem('configs');
            if (!storedConfigs) {
                if (recordTypes?.length) set({ configs: defaults });
                return;
            }

            const parsed = JSON.parse(storedConfigs) as Partial<Configs>;
            const parsedRecordTypes = Array.isArray(parsed.recordTypes) ? parsed.recordTypes : [];
            const groupPeriod = migrateLegacyGroupPeriod(parsed, defaults);
            const merged: Configs = {
                recordTypes: parsedRecordTypes.length > 0 ? parsedRecordTypes : defaults.recordTypes,
                creditType:
                    typeof parsed.creditType === 'number' && parsed.creditType > 0
                        ? parsed.creditType
                        : defaults.creditType,
                paymentCreditType:
                    typeof parsed.paymentCreditType === 'number' && parsed.paymentCreditType > 0
                        ? parsed.paymentCreditType
                        : defaults.paymentCreditType,
                pendingPaymentDateMode: isPendingPaymentDateMode(
                    parsed.pendingPaymentDateMode
                )
                    ? parsed.pendingPaymentDateMode
                    : defaults.pendingPaymentDateMode,
                pendingFixedDateMode: isPendingFixedDateMode(
                    parsed.pendingFixedDateMode
                )
                    ? parsed.pendingFixedDateMode
                    : defaults.pendingFixedDateMode,
                pendingFixedDedupeMode: isPendingFixedDedupeMode(
                    parsed.pendingFixedDedupeMode
                )
                    ? parsed.pendingFixedDedupeMode
                    : defaults.pendingFixedDedupeMode,
                groupAutoCreate: isBoolean(parsed.groupAutoCreate)
                    ? parsed.groupAutoCreate
                    : defaults.groupAutoCreate,
                groupPeriodMode: groupPeriod.mode,
                groupStartDay: groupPeriod.startDay,
                closingPeriodMode: isClosingPeriodMode(parsed.closingPeriodMode)
                    ? parsed.closingPeriodMode
                    : defaults.closingPeriodMode,
                closingCutoffDay: isClosingDay(parsed.closingCutoffDay)
                    ? parsed.closingCutoffDay
                    : defaults.closingCutoffDay,
                closingStartDay: isClosingDay(parsed.closingStartDay)
                    ? parsed.closingStartDay
                    : defaults.closingStartDay,
                closingGraceDays: isClosingGraceDays(parsed.closingGraceDays)
                    ? parsed.closingGraceDays
                    : defaults.closingGraceDays,
                closingAllowPeriodOverride: isBoolean(
                    parsed.closingAllowPeriodOverride
                )
                    ? parsed.closingAllowPeriodOverride
                    : defaults.closingAllowPeriodOverride,
            };

            set({ configs: merged });

            const wasIncomplete =
                parsedRecordTypes.length === 0 ||
                !(typeof parsed.creditType === 'number' && parsed.creditType > 0) ||
                !(typeof parsed.paymentCreditType === 'number' && parsed.paymentCreditType > 0) ||
                !isPendingPaymentDateMode(parsed.pendingPaymentDateMode) ||
                !isPendingFixedDateMode(parsed.pendingFixedDateMode) ||
                !isPendingFixedDedupeMode(parsed.pendingFixedDedupeMode) ||
                !isBoolean(parsed.groupAutoCreate) ||
                !isGroupPeriodMode(parsed.groupPeriodMode) ||
                !isGroupStartDay(parsed.groupStartDay) ||
                !isClosingGraceDays(parsed.closingGraceDays) ||
                !isBoolean(parsed.closingAllowPeriodOverride);
            if (wasIncomplete && recordTypes?.length) {
                await AsyncStorage.setItem('configs', JSON.stringify(merged));
            }
        } catch (error) {
            console.error("Error loading configs from AsyncStorage:", error);
        }
    },

    saveConfigs: async (newConfigs: Configs) => {
        try {
            await AsyncStorage.setItem('configs', JSON.stringify(newConfigs));
            set({ configs: newConfigs });
        } catch (error) {
            console.error("Error saving configs to AsyncStorage:", error);
        }
    },
}));

export default useConfigs;
