// components/property/PropertySearchFilter.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

export default function PropertySearchFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [location, setLocation] = useState(searchParams.get('location') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);
        if (location) params.set('location', location); else params.delete('location');
        if (minPrice) params.set('minPrice', minPrice); else params.delete('minPrice');
        if (maxPrice) params.set('maxPrice', maxPrice); else params.delete('maxPrice');
        
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <Card className="mb-8">
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input placeholder="e.g., Masaki, Mbezi Beach" value={location} onChange={e => setLocation(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Min Price (TSh)</label>
                        <Input type="number" placeholder="e.g., 500000" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Max Price (TSh)</label>
                        <Input type="number" placeholder="e.g., 2000000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                    </div>
                    <Button onClick={handleSearch} className="w-full">
                        <Search className="mr-2 h-4 w-4" /> Search
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}