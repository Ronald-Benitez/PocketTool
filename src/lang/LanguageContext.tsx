import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import es from './es.json';
import { LanguageContent } from '@/src/interfaces/lang';

const LanguageContext = createContext<any>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<'en' | 'es'>('en');

    useEffect(() => {
        const loadLanguage = async () => {
            const storedLanguage = await AsyncStorage.getItem('appLanguage');
            if (storedLanguage) {
                setLanguage(storedLanguage as 'en' | 'es');
            }
        };

        loadLanguage();
    }, []);

    const changeLanguage = async (lang: 'en' | 'es') => {
        setLanguage(lang);
        await AsyncStorage.setItem('appLanguage', lang);  // Guardar el idioma en AsyncStorage
    };

    const getMonths = () => {
        return language === 'en' ? en.months : es.months;
    };

    const t = (key: string) => {
        const keys = key.split('.') as Array<keyof LanguageContent['groups']>;
        let translation = language === 'en' ? en : es;

        for (const k of keys) {
            //@ts-ignore
            translation = translation[k];
        }

        return translation || key;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, getMonths }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
