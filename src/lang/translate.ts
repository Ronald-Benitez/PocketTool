import { en, messages, type TranslationKey } from './messages';
import type { Language, TranslationParams } from './messages/types';

export const resolvePath = (source: unknown, key: string): unknown =>
  key.split('.').reduce<unknown>((value, part) => {
    if (!value || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[part];
  }, source);

export const interpolate = (value: string, params?: TranslationParams): string => {
  if (!params) return value;
  return Object.entries(params).reduce(
    (result, [key, replacement]) =>
      result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(replacement)),
    value
  );
};

export const translate = (
  language: Language,
  key: TranslationKey,
  params?: TranslationParams
): string => {
  const localized = resolvePath(messages[language], key);
  if (typeof localized === 'string') return interpolate(localized, params);

  const fallback = resolvePath(en, key);
  if (typeof fallback === 'string') {
    if (__DEV__) {
      console.warn(`[i18n] Falta "${key}" en ${language}; se usa inglés.`);
    }
    return interpolate(fallback, params);
  }

  if (__DEV__) {
    console.warn(`[i18n] Clave inexistente: "${key}".`);
  }
  return key;
};
