import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { RecordType } from '@/src/interfaces/schema';
import type { PendingPaymentDateMode } from '@/src/domain/credits/pending';

export interface Configs {
    recordTypes: number[];
    creditType: number;
    paymentCreditType: number;
    pendingPaymentDateMode: PendingPaymentDateMode;
}

const DEFAULT_RECORD_TYPES = ['Income', 'Expense'];
const DEFAULT_CREDIT_TYPE = 'Credit expenses';
const DEFAULT_PAYMENT_CREDIT_TYPE = 'Payments';
const DEFAULT_PENDING_PAYMENT_DATE_MODE: PendingPaymentDateMode = 'today';

const isPendingPaymentDateMode = (
    value: unknown
): value is PendingPaymentDateMode =>
    value === 'today' || value === 'payment_date';

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
                };

            const storedConfigs = await AsyncStorage.getItem('configs');
            if (!storedConfigs) {
                if (recordTypes?.length) set({ configs: defaults });
                return;
            }

            const parsed = JSON.parse(storedConfigs) as Partial<Configs>;
            const parsedRecordTypes = Array.isArray(parsed.recordTypes) ? parsed.recordTypes : [];
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
            };

            set({ configs: merged });

            const wasIncomplete =
                parsedRecordTypes.length === 0 ||
                !(typeof parsed.creditType === 'number' && parsed.creditType > 0) ||
                !(typeof parsed.paymentCreditType === 'number' && parsed.paymentCreditType > 0) ||
                !isPendingPaymentDateMode(parsed.pendingPaymentDateMode);
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