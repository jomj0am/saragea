// components/tenant/ContactAdminButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export default function ContactAdminButton() {
    const [adminId, setAdminId] = useState<string | null>(null);
    const router = useRouter();

    // Njia ya mfano ya kupata admin mmoja. Kwenye mfumo mkubwa, hii inaweza kuwa API call.
    useEffect(() => {
        // Hapa tunaweza kufanya fetch('/api/admins') au kuweka ID maalum
        const findAdminId = async () => {
             const response = await fetch('/api/admin-contact'); // API route mpya
             const data = await response.json();
             if (data.adminId) setAdminId(data.adminId);
        }
        findAdminId();
    }, []);

    const handleContact = () => {
        // Tofauti hapa, hatuanzishi mazungumzo moja kwa moja.
        // Tunampeleka tu kwenye ukurasa wa meseji.
        // UI ya meseji itashughulikia kuanzisha mazungumzo kama bado hayapo.
        router.push('/dashboard/messages');
    };

    return (
        <Button onClick={handleContact}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Contact Admin
        </Button>
    );
}