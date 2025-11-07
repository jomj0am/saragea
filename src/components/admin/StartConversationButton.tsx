// components/admin/StartConversationButton.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
interface StartConversationButtonProps {
tenantId: string;
adminId: string;
}
export default function StartConversationButton({ tenantId }: StartConversationButtonProps) {
const [isLoading, setIsLoading] = useState(false);
const router = useRouter();
const { toast } = useToast();

const handleStartConversation = async () => {
    setIsLoading(true);
    try {
        // Hii ni API route ya kutuma ujumbe wa kwanza
        // Itatengeneza mazungumzo kama bado hayapo
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipientId: tenantId, // Tunamtumia nani?
                content: `Hello! This is the start of your conversation.`, // Ujumbe wa kwanza wa mfano
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to start conversation.');
        }

        toast({ title: 'Conversation started!', description: 'You can now chat with the tenant.' });
        
        // Mpeleke admin kwenye ukurasa wa meseji
        router.push('/admin/messages');
        
    } catch (error: unknown) {
            let message = 'Something went wrong';

    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }
        toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
        setIsLoading(false);
    }
};

return (
    <Button onClick={handleStartConversation} disabled={isLoading}>
        {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
            <MessageSquarePlus className="mr-2 h-4 w-4" />
        )}
        Start Conversation
    </Button>
);
}