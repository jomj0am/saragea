// components/landing/GlobalSearch.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Building, DoorOpen, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type PropertySearchResult = {
  id: string;
  type: 'Property';
  name: string;
  location: string;
};

type RoomSearchResult = {
  id: string;
  type: 'Room';
  roomNumber: string;
  property: { name: string };
};

type SearchResult = PropertySearchResult | RoomSearchResult;

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations('GlobalSearch');
  const commandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    setIsOpen(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      const data: SearchResult[] = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFetch = useDebouncedCallback(fetchResults, 400);

  const handleSelect = (url: string) => {
    router.push(url);
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  const hasResults = results.length > 0;
  const showDropdown = isOpen && query.length > 1;

  const propertyResults = results.filter(
    (r): r is PropertySearchResult => r.type === 'Property'
  );
  const roomResults = results.filter(
    (r): r is RoomSearchResult => r.type === 'Room'
  );

  return (
    <div ref={commandRef} className="relative w-full z-80">
      {/* One single input field—no extra top/bottom input */}
      <Command className="rounded-full border py-1 shadow-lg bg-background/40 backdrop-blur-sm overflow-visible z-80">
          {/* ✅ single input only */}
        <CommandInput
          placeholder={t('placeholder')}
          value={query}
          className=''
          onValueChange={(q) => {
            setQuery(q);
            debouncedFetch(q);
          }}
          onFocus={() => {
            if (query.length > 1) setIsOpen(true);
          }}
        />
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.42, 0, 0.58, 1] }}
              className="absolute top-full left-0 mt-2 w-full z-80"
            >
              <CommandList className="rounded-lg border bg-background shadow-xl max-h-[300px] overflow-y-auto z-80">
                {isLoading ? (
                  <div className="p-4 flex items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('searching')}
                  </div>
                ) : hasResults ? (
                  <>
                    {propertyResults.length > 0 && (
                      <CommandGroup heading={t('propertiesHeading')}>
                        {propertyResults.map((p) => (
                          <CommandItem
                            key={p.id}
                            onSelect={() => handleSelect(`/properties/${p.id}`)}
                            className="cursor-pointer z-80"
                          >
                            <Building className="mr-2 h-4 w-4" />
                            <span>
                              {p.name}{' '}
                              <span className="text-muted-foreground">– {p.location}</span>
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    {roomResults.length > 0 && (
                      <CommandGroup heading={t('roomsHeading')}>
                        {roomResults.map((r) => (
                          <CommandItem
                            key={r.id}
                            onSelect={() => handleSelect(`/rooms/${r.id}`)}
                            className="cursor-pointer z-80"
                          >
                            <DoorOpen className="mr-2 h-4 w-4" />
                            <span>
                              Room {r.roomNumber} in{' '}
                              <span className="text-muted-foreground">{r.property.name}</span>
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </>
                ) : (
                  <CommandEmpty className="p-4 text-center text-muted-foreground z-80">
                    {t('noResults')}
                  </CommandEmpty>
                )}
              </CommandList>
            </motion.div>
          )}
        </AnimatePresence>
      </Command>
    </div>
  );
}
