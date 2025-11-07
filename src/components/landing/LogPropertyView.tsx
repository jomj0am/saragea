// components/property/LogPropertyView.tsx
'use client';
import { useEffect } from 'react';

const MAX_RECENTLY_VIEWED = 5;

export default function LogPropertyView({ propertyId }: { propertyId: string }) {
    useEffect(() => {
        const stored = localStorage.getItem('recentlyViewed');
        let viewed: string[] = stored ? JSON.parse(stored) : [];
        
        // Ondoa ID kama tayari ipo ili kuiweka mbele
        viewed = viewed.filter(id => id !== propertyId);
        // Ongeza ID mpya mbele
        viewed.unshift(propertyId);
        // Hakikisha orodha haizidi ukubwa
        if (viewed.length > MAX_RECENTLY_VIEWED) {
            viewed.pop();
        }
        
        localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
    }, [propertyId]);

    return null; // Komponenti hii haionyeshi chochote
}