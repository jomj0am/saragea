// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { prisma } from '@/lib/prisma';

// --- REKEBISHO #1: Bainisha 'Type' kwa ajili ya Nested Messages ---
// Hii 'type' inaruhusu 'object' kuwa na 'keys' za 'string' na 'values'
// ambazo zinaweza kuwa 'string' au 'object' nyingine kama hii.
type NestedMessages = {
  [key: string]: string | NestedMessages;
};

export default getRequestConfig(async ({ requestLocale }) => {
  // 1. Tambua 'locale' (inabaki kama ilivyo)
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // 2. Pata tafsiri kutoka database (inabaki kama ilivyo)
  const dbTranslations = await prisma.translation.findMany({
    where: { locale: locale },
    select: { key: true, value: true },
  });

  // 3. Badilisha muundo wa 'flat' kuwa 'nested' object (IMeboreshwa)
  const messages: NestedMessages = {};
  for (const { key, value } of dbTranslations) {
      const keys = key.split('.');
      
      // 'reduce' sasa itakuwa na 'type' sahihi
      keys.reduce((acc: NestedMessages, currentKey: string, index: number) => {
          // Hakikisha 'acc' ni 'object'
          if (typeof acc !== 'object' || acc === null) {
              return {}; // 'Fallback' kwa usalama, ingawa haipaswi kutokea
          }

          if (index === keys.length - 1) {
              acc[currentKey] = value;
          } else {
              // Kama 'key' inayofuata haipo au sio 'object', tengeneza 'object' tupu
              if (typeof acc[currentKey] !== 'object' || acc[currentKey] === null) {
                  acc[currentKey] = {};
              }
          }
          // 'TypeScript' sasa inajua 'acc[currentKey]' ni 'NestedMessages'
          return acc[currentKey] as NestedMessages;
      }, messages);
  }

  // 'next-intl' inatarajia 'AbstractIntlMessages' ambayo ni 'Record<string, unknown>'
  // Kwa hiyo, 'NestedMessages' yetu inakubalika.
  return {
    locale,
    messages: messages, 
  };
});