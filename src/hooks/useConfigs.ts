import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Configs {
    recordTypes: number[];
}

export const useConfigs = () => {
    const [configs, setConfigs] = useState<Configs>({ recordTypes: [1, 2] });

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        try {
            const storedConfigs = await AsyncStorage.getItem('configs');
            if (storedConfigs) {
                setConfigs(JSON.parse(storedConfigs));
            }
        } catch (error) {
            console.error("Error loading configs:", error);
        }
    };

    const saveConfigs = async (newConfigs: Configs) => {
        try {
            await AsyncStorage.setItem('configs', JSON.stringify(newConfigs));
            setConfigs(newConfigs);
        } catch (error) {
            console.error("Error saving configs:", error);
        }
    };

    return { configs, saveConfigs };
};

export default useConfigs;