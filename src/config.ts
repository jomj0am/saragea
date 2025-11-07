// i18n/config.ts
export const locales = ['en', 'sw' , 'fr'] as const;
export const defaultLocale = 'en';

export type Locale = (typeof locales)[number];