import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { RecordType } from '@/src/interfaces/schema';

export interface Configs {
    recordTypes: number[];
    creditType: number;
    paymentCreditType: number;
}

const DEFAULT_RECORD_TYPES = ['Income', 'Expense'];
const DEFAULT_CREDIT_TYPE = 'Credit expenses';
const DEFAULT_PAYMENT_CREDIT_TYPE = 'Payments';

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
    };
};

interface ConfigsStore {
    configs: Configs;
    loadConfigs: (recordTypes?: RecordType[]) => Promise<void>;
    saveConfigs: (newConfigs: Configs) => Promise<void>;
}

export const useConfigs = create<ConfigsStore>((set) => ({
    configs: { recordTypes: [], creditType: 0, paymentCreditType: 0 },

    loadConfigs: async (recordTypes) => {
        try {
            const defaults = recordTypes?.length
                ? resolveDefaultConfigs(recordTypes)
                : { recordTypes: [], creditType: 0, paymentCreditType: 0 };

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
            };

            set({ configs: merged });

            const wasIncomplete =
                parsedRecordTypes.length === 0 ||
                !(typeof parsed.creditType === 'number' && parsed.creditType > 0) ||
                !(typeof parsed.paymentCreditType === 'number' && parsed.paymentCreditType > 0);
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