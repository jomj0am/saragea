// components/property/PropertyFilters.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '../ui/button';
import { amenityList } from '@/lib/amenities'; // Tunatumia orodha yetu kuu
import { Filter, X } from 'lucide-react';


export default function PropertyFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Function kuu ya kusasisha URL
    const updateUrlParams = useDebouncedCallback((key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value.length > 0) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleAmenityChange = (amenityKey: string, checked: boolean | 'indeterminate') => {
        const currentAmenities = searchParams.get('amenities')?.split(',') || [];
        let newAmenities: string[];
        if (checked) {
            newAmenities = [...currentAmenities, amenityKey];
        } else {
            newAmenities = currentAmenities.filter(a => a !== amenityKey);
        }
        updateUrlParams('amenities', newAmenities.join(','));
    };
    


    const clearFilters = () => {
        router.replace(pathname);
    };

    // Pata thamani za sasa kutoka kwenye URL
    // const currentPrice = searchParams.get('price')?.split('-').map(Number) || [0, MAX_PRICE];
    const currentAmenities = searchParams.get('amenities')?.split(',') || [];
    const hasActiveFilters = searchParams.toString().length > 0;

    return (
        <Card className="shadow-md border-dashed">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className='flex items- gap-2'>
                    <Filter size={25} className='fill-green-200 text-green-400'/>
                    <div>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Refine your search.</CardDescription>
                    </div>
                </div>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="mr-2 h-4 w-4" /> Clear All
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Search by Name/Location */}
                <div>
                    <Label className='pb-2' htmlFor="search-query">Location or Name</Label>
                    <Input 
                        id="search-query"
                        placeholder="e.g., Masaki, Towers"
                        defaultValue={searchParams.get('q') || ''}
                        onChange={(e) => updateUrlParams('q', e.target.value)}
                        className='border-dashed'
                    />

                </div>

 

                {/* Amenities Checkboxes */}
                <div>
                    <Label>Amenities</Label>
                    <div className="space-y-3 mt-2">
                        {amenityList.slice(0, 6).map(amenity => ( // Onyesha 6 za kwanza
                            <div key={amenity.key} className="flex items-center gap-3">
                                <Checkbox
                                    id={amenity.key}
                                    onCheckedChange={(checked) => handleAmenityChange(amenity.key, checked)}
                                    checked={currentAmenities.includes(amenity.key)}
                                />
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">{amenity.icon}</span>
                                    <Label htmlFor={amenity.key} className="font-normal cursor-pointer">
                                        {amenity.name}
                                    </Label>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Hapa unaweza kuongeza 'Collapsible' kuonyesha amenities zote */}
                </div>
            </CardContent>
        </Card>
    );
}