'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'sw', label: 'Kiswahili', flag: '🇹🇿' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
];

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLocale = (value: string) => {
    if (isPending || value === locale) return;
    const segments = pathname.split('/');
    const knownLocales = ['en', 'sw', 'fr'];
    if (knownLocales.includes(segments[1])) segments.splice(1, 1);
    const newPath = segments.join('/');
    startTransition(() => {
      router.replace(`/${value}${newPath}`);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative flex w-full justify-center gap-3 rounded-2xl bg-gradient-to-br from-white/20 to-muted-foreground/20 dark:from-muted/60 dark:to-muted/40 !p-2 shadow-lg backdrop-blur-xl"
    >
      {/* Animated pill background that slides to the active language */}
      <motion.div
        layoutId="lang-pill"
        className="absolute top-1 bottom-1 rounded-xl bg-primary/20 "
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          left: `${LANGUAGES.findIndex(l => l.value === locale) * 33.33}%`,
          width: `${100 / LANGUAGES.length}%`,
        }}
      />

      {LANGUAGES.map(({ value, label, flag }) => {
        const active = locale === value;
        return (
          <button
            key={value}
            disabled={isPending}
            onClick={() => changeLocale(value)}
            className={cn(
              'relative z-10 flex flex-col items-center justify-center mx-auto rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ',
              active
                ? 'text-primary font-semibold scale-105'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="text-xl">{flag}</span>
            <span className="mt-1">{label}</span>
          </button>
        );
      })}
    </motion.div>
  );
}
