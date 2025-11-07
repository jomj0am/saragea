// components/admin/TableToolbar.tsx
'use client';

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search } from "lucide-react";

// 'Interface' ya props tunazotarajia kupokea
interface TableToolbarProps {
    searchPlaceholder: string;
    filterOptions?: {
        placeholder: string;
        paramName: string; // Jina la 'query param' kwenye URL (k.m., "status")
        options: { value: string; label: string }[];
    };
}

export default function TableToolbar({ searchPlaceholder, filterOptions }: TableToolbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    /**
     * Handles search input changes.
     * It uses debounce to avoid sending a request on every keystroke.
     * The request is sent only after the user has stopped typing for 300ms.
     */
    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1'); // Rudisha kwenye ukurasa wa kwanza kila utafutapo
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        // Tumia 'replace' badala ya 'push' ili kuepuka kujaza historia ya browser
        router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    /**
     * Handles filter selection changes.
     * It updates the URL immediately upon selection.
     */
    const handleFilter = (value: string) => {
        if (!filterOptions) return;

        const params = new URLSearchParams(searchParams);
        params.set('page', '1'); // Rudisha kwenye ukurasa wa kwanza kila uchujapo
        if (value && value !== 'all') {
            params.set(filterOptions.paramName, value);
        } else {
            params.delete(filterOptions.paramName);
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center justify-between gap-4 mb-4">
            {/* Search Input */}
            <div className="relative flex-1 md:grow-0">
                <Search className="absolute fill-cyan-100/80 text-cyan-500 left-2.5 top-2.5 h-4 w-4 " />
                <Input
                    type="search"
                    placeholder={searchPlaceholder}
                    defaultValue={searchParams.get('q') || ''}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] rounded-full shadow-md dark:shadow-blue-950/50 dark:border-slate-700/30"
                />
            </div>

            {/* Filter Select Dropdown (inaonekana tu kama 'filterOptions' zimepitishwa) */}
            {filterOptions && (
                <Select 
                    onValueChange={handleFilter} 
                    defaultValue={searchParams.get(filterOptions.paramName) || 'all'}
                >
                    <SelectTrigger className=" max-w-20 md:max-w-36 md:w-[140px] rounded-full shadow-md dark:shadow-blue-950/50 dark:border-slate-700/30">
                        <SelectValue placeholder={filterOptions.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {filterOptions.options.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}