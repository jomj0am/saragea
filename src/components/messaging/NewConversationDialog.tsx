// components/messaging/NewConversationDialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { type User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { MessageSquarePlus } from 'lucide-react';

interface NewConversationDialogProps {
    onConversationSelect: (tenant: User) => void;
}

export default function NewConversationDialog({ onConversationSelect }: NewConversationDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tenants, setTenants] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            fetch('/api/tenants')
                .then(res => res.json())
                .then(data => setTenants(data))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen]);

    const handleSelect = (tenant: User) => {
        onConversationSelect(tenant);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                    Start Conversation
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Start a new conversation</DialogTitle>
                    <DialogDescription>Select a tenant to begin chatting with.</DialogDescription>
                </DialogHeader>
                <Command>
                    <CommandInput placeholder="Search for a tenant..." />
                    <CommandList>
                        {isLoading && <p className="p-4 text-sm">Loading tenants...</p>}
                        <CommandEmpty>No tenants found.</CommandEmpty>
                        <CommandGroup>
                            {tenants.map((tenant) => (
                                <CommandItem key={tenant.id} onSelect={() => handleSelect(tenant)}>
                                    {tenant.name} ({tenant.email})
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
}