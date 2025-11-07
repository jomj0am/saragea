// components/admin/AmenitySelector.tsx
'use client';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui/button";

const PRESET_AMENITIES = ["Swimming Pool", "Gym", "24/7 Security", "Parking", "Wi-Fi", "Air Conditioning", "Ocean View", "Garden"];

interface AmenitySelectorProps {
    value: string[];
    onChange: (value: string[]) => void;
}

export default function AmenitySelector({ value, onChange }: AmenitySelectorProps) {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        if (inputValue && !value.includes(inputValue)) {
            onChange([...value, inputValue]);
        }
        setInputValue('');
    };

    const handleRemove = (amenityToRemove: string) => {
        onChange(value.filter(amenity => amenity !== amenityToRemove));
    };
    
    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Add a new amenity..." />
                <Button type="button" onClick={handleAdd}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {value.map(amenity => (
                    <Badge key={amenity} variant="secondary" className="text-sm">
                        {amenity}
                        <button onClick={() => handleRemove(amenity)} className="ml-2"><X className="h-3 w-3" /></button>
                    </Badge>
                ))}
            </div>
            <p className="text-xs text-muted-foreground">Or click to add presets:</p>
            <div className="flex flex-wrap gap-2">
                {PRESET_AMENITIES.filter(pa => !value.includes(pa)).map(pa => (
                    <Badge key={pa} onClick={() => onChange([...value, pa])} className="cursor-pointer">
                        {pa}
                    </Badge>
                ))}
            </div>
        </div>
    );
}