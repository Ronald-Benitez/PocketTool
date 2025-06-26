import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface Configs {
    recordTypes: number[];
    creditType: number;
    paymentCreditType: number;
}

interface ConfigsStore {
    configs: Configs;
    loadConfigs: () => Promise<void>;
    saveConfigs: (newConfigs: Configs) => Promise<void>;
}

export const useConfigs = create<ConfigsStore>((set, get) => ({
    configs: { recordTypes: [1, 2], creditType: 4, paymentCreditType: 5 },

    loadConfigs: async () => {
        try {
            const storedConfigs = await AsyncStorage.getItem('configs');
            if (storedConfigs) {
                set({ configs: JSON.parse(storedConfigs) });
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