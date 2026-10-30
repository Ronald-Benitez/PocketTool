import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  messages,
  type TranslationKey,
} from './messages';
import type { Language, TranslationParams } from './messages/types';
import { translate } from './translate';

type LanguageContextValue = {
  language: Language;
  changeLanguage: (language: Language) => Promise<void>;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  getMonths: () => string[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'appLanguage';

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedLanguage === 'en' || storedLanguage === 'es') {
        setLanguage(storedLanguage);
      }
    };

    loadLanguage();
  }, []);

  const changeLanguage = useCallback(async (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    await AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) =>
      translate(language, key, params),
    [language]
  );

  const getMonths = useCallback(
    () => Object.values(messages[language].months) as string[],
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      changeLanguage,
      t,
      getMonths,
    }),
    [language, changeLanguage, t, getMonths]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  }
  return context;
};

export type { Language, TranslationKey };
