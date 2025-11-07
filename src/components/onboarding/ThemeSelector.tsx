'use client';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const themes = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'system', label: 'System', icon: Laptop },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative flex w-full items-center justify-between rounded-2xl bg-gradient-to-br from-white/20 to-muted-foreground/20 dark:from-muted/60 dark:to-muted/40 p-2 shadow-lg backdrop-blur-xl"
    >
      {themes.map(({ key, label, icon: Icon }) => {
        const active = theme === key;
        return (
          <button
            key={key}
            onClick={() => setTheme(key)}
            className={cn(
              'group relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
              active
                ? 'bg-primary/20 text-primary shadow-md scale-105'
                : 'text-muted-foreground hover:text-foreground '
            )}
          >
            {/* subtle animated highlight ring */}
            {active && (
              <motion.span
                layoutId="theme-pill"
                className="absolute inset-0 z-0 rounded-xl "
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            <Icon
              className={cn(
                'relative z-10 h-5 w-5 transition-transform duration-300',
                active ? 'rotate-0 scale-110' : 'group-hover:scale-105'
              )}
            />
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </motion.div>
  );
}
