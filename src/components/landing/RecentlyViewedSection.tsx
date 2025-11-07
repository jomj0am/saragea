// components/landing/RecentlyViewedSection.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import PropertyCard from '../shared/PropertyCard';
import { type Prisma } from '@prisma/client';
import { motion } from 'framer-motion';

// --- REKEBISHO #1: Tumia 'Type' Sahihi ---
// Hii ni 'type' tuliyoitumia kwenye PropertyCard. Lazima zifanane.
type PropertyWithDetails = Prisma.PropertyGetPayload<{
    include: {
        rooms: { where: { isOccupied: false } };
        _count: { select: { rooms: true } };
    };
}>;

// Komponenti ya 'skeleton loader' kwa ajili ya 'UX' bora
const SkeletonLoader = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
                <div className="bg-muted h-52 w-full rounded-lg animate-pulse"></div>
                <div className="bg-muted h-6 w-3/4 rounded animate-pulse"></div>
                <div className="bg-muted h-4 w-1/2 rounded animate-pulse"></div>
            </div>
        ))}
    </div>
);


export default function RecentlyViewedSection() {
    const t = useTranslations('HomePageV3.RecentlyViewed');
    // Tumia 'type' yetu kwenye 'state'
    const [properties, setProperties] = useState<PropertyWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // --- REKEBISHO #2: Fanya kazi hii iwe 'async' kwa usafi ---
        const fetchViewedProperties = async () => {
            try {
                const stored = localStorage.getItem('recentlyViewed');
                const viewedIds: string[] = stored ? JSON.parse(stored) : [];

                if (viewedIds.length > 0) {
                    const response = await fetch(`/api/properties/batch?ids=${viewedIds.join(',')}`);
                    if (!response.ok) {
                        // Kama kuna kosa, usionyeshe chochote
                        setProperties([]);
                        return;
                    }
                    const data: PropertyWithDetails[] = await response.json();
                    setProperties(data);
                }
            } catch (error) {
                console.error("Failed to fetch recently viewed properties:", error);
                setProperties([]); // Weka tupu kama kuna kosa
            } finally {
                setIsLoading(false);
            }
        };

        fetchViewedProperties();
    }, []);

    // --- REKEBISHO #3: Boresha 'Conditional Rendering' ---
    // Usionyeshe 'section' nzima kama hakuna cha kuonyesha
    if (properties.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-secondary/50">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold">{t('sectionTitle')}</h2>
                </motion.div>
                
                {isLoading ? (
                    <SkeletonLoader />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {properties.map((property, index) => (
                             <motion.div
                                key={property.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <PropertyCard property={property} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}