import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'sw' , 'fr'];
export const defaultLocale = 'en';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always', // forces /en or /sw in URL
});
