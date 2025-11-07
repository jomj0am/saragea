// lib/amenities.tsx
import { Car, Wifi, Dumbbell, Droplets, Snowflake, ShieldCheck, Tv, Wind, Sun, UtensilsCrossed } from 'lucide-react';
import React from 'react';

// Orodha kamili ya amenities tunazozijua na icons zake
export const amenityList = [
    { name: "Parking", icon: <Car className="h-4 w-4" />, key: "parking" },
    { name: "Wi-Fi", icon: <Wifi className="h-4 w-4" />, key: "wi-fi" },
    { name: "Gym", icon: <Dumbbell className="h-4 w-4" />, key: "gym" },
    { name: "Swimming Pool", icon: <span>🏊</span>, key: "swimming pool" },
    { name: "Water", icon: <Droplets className="h-4 w-4" />, key: "water" },
    { name: "Air Conditioning", icon: <Snowflake className="h-4 w-4" />, key: "air conditioning" },
    { name: "24/7 Security", icon: <ShieldCheck className="h-4 w-4" />, key: "24/7 security" },
    { name: "TV", icon: <Tv className="h-4 w-4" />, key: "tv" },
    { name: "Fan", icon: <Wind className="h-4 w-4" />, key: "fan" },
    { name: "Balcony", icon: <Sun className="h-4 w-4" />, key: "balcony" },
    { name: "Kitchen", icon: <UtensilsCrossed className="h-4 w-4" />, key: "kitchen" },
];

// Function ya kupata icon kulingana na jina la amenity
export const getAmenityIcon = (amenityName: string): React.ReactNode | null => {
    const amenity = amenityList.find(a => a.key === amenityName.toLowerCase());
    return amenity ? amenity.icon : null;
};