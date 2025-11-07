// components/messaging/MessagingInterface.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { pusherClient } from '@/lib/pusher';
import ConversationSidebar from './ConversationSidebar';
import ChatWindow from './ChatWindow';
import { Loader2 } from 'lucide-react';
import { type User } from '@prisma/client';
import { 
    type ConversationWithDetails, 
    type MessageWithSender, 
    type PseudoConversation, 
    type SimpleUser 
} from '@/types/messaging'; // Import types zetu
import { useToast } from '../ui/use-toast';

export default function MessagingInterface() {
    const { data: session, status: sessionStatus } = useSession();
    const currentUser = session?.user as User;
    const { toast } = useToast();

    // Tumia types zetu kwenye state
    const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
    const [activeConversation, setActiveConversation] = useState<ConversationWithDetails | PseudoConversation | null>(null);
    const [messages, setMessages] = useState<MessageWithSender[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // Fetch conversations
    useEffect(() => {
        if (currentUser?.id) {
            setIsLoadingConversations(true);
            fetch('/api/conversations')
                .then(res => res.json())
                .then((data: ConversationWithDetails[]) => setConversations(data))
                .catch(() => toast({ variant: 'destructive', title: 'Error', description: 'Failed to load conversations.' }))
                .finally(() => setIsLoadingConversations(false));
        }
    }, [currentUser, toast]);

    // Real-time updates na Pusher
    useEffect(() => {
        if (!activeConversation?.id || 'isPseudo' in activeConversation) return;

        pusherClient.subscribe(activeConversation.id);
        
        const messageHandler = (newMessage: MessageWithSender) => {
            if (newMessage.senderId !== currentUser?.id) {
                setMessages((current) => [...current, newMessage]);
                // Sasisha sidebar
                setConversations(prev => prev.map(c => 
                    c.id === newMessage.conversationId 
                    ? { ...c, messages: [newMessage], updatedAt: newMessage.createdAt }
                    : c
                ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
            }
        };
        pusherClient.bind('messages:new', messageHandler);

        return () => {
            if (activeConversation?.id) {
                pusherClient.unsubscribe(activeConversation.id);
                pusherClient.unbind('messages:new', messageHandler);
            }
        };
    }, [activeConversation, currentUser]);
    
    // Function ya kuchagua mazungumzo
    const handleSelectConversation = useCallback(async (conv: ConversationWithDetails) => {
        setActiveConversation(conv);
        setIsLoadingMessages(true);
        try {
            const res = await fetch(`/api/conversations/${conv.id}/messages`);
            const data: MessageWithSender[] = await res.json();
            setMessages(data);
            setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, _count: { messages: 0 } } : c));
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load messages.' });
        } finally {
            setIsLoadingMessages(false);
        }
    }, [toast]);

    // Function ya kuanzisha mazungumzo mapya
    const handleStartNewConversation = useCallback(async (tenant: SimpleUser) => {
        const existingConv = conversations.find(c => c.otherParty.id === tenant.id);
        if (existingConv) {
            handleSelectConversation(existingConv);
            return;
        }

        setActiveConversation({
            id: `new-${tenant.id}`,
            otherParty: tenant,
            isPseudo: true,
        });
        setMessages([]);
    }, [conversations, handleSelectConversation]);

    // Function ya kutuma ujumbe
    const handleSendMessage = useCallback(async (content: string) => {
        if (!activeConversation) return;
        
        // Data ya kutuma kwenda API
        const payload = {
            content,
            conversationId: 'isPseudo' in activeConversation ? null : activeConversation.id,
            recipientId: 'isPseudo' in activeConversation ? activeConversation.otherParty.id : null,
        };
        
        // Optimistic UI: Ongeza ujumbe kwenye state kabla haujafika server
        const optimisticMessage: MessageWithSender = {
            id: `optimistic-${Date.now()}`,
            content,
            createdAt: new Date(),
            senderId: currentUser.id,
            sender: { id: currentUser.id, name: currentUser.name, image: currentUser.image },
            isRead: false,
            conversationId: 'isPseudo' in activeConversation ? '' : activeConversation.id,
        };
        setMessages(current => [...current, optimisticMessage]);

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to send message');
            const newMessage: MessageWithSender = await response.json();

            // Kama yalikuwa mazungumzo mapya, refresh orodha ya mazungumzo
            if ('isPseudo' in activeConversation) {
                const convRes = await fetch('/api/conversations');
                const newConversations: ConversationWithDetails[] = await convRes.json();
                setConversations(newConversations);
                // Weka mazungumzo mapya yawe 'active'
                const newActiveConv = newConversations.find(c => c.id === newMessage.conversationId);
                if (newActiveConv) setActiveConversation(newActiveConv);
            }

            // Sasisha ujumbe wa 'optimistic' na ule halisi
            setMessages(current => current.map(m => m.id === optimisticMessage.id ? newMessage : m));
            
        } catch {
            toast({ variant: 'destructive', title: "Message Failed", description: "Your message could not be sent." });
            // Ondoa ujumbe wa 'optimistic'
            setMessages(current => current.filter(m => m.id !== optimisticMessage.id));
        }
    }, [activeConversation, currentUser, toast]);

 // Onyesha 'loading' state wakati session inapakuliwa
if (sessionStatus === 'loading' || isLoadingConversations) {
    return (
        <div className="flex h-[calc(100vh-10rem)] border rounded-lg bg-background items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
}

// Onyesha ujumbe wa kosa kama hakuna session
if (!currentUser) {
    return <div className="p-4 text-center">Please log in to view messages.</div>;
}

    return (
        <div className="flex h-[calc(100vh-10rem)] border rounded-lg bg-background">
            <ConversationSidebar 
                conversations={conversations}
                activeConversation={activeConversation}
                onSelectConversation={handleSelectConversation}
                onStartNewConversation={handleStartNewConversation}
                currentUser={currentUser} 
            />
            <ChatWindow 
                conversation={activeConversation}
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoadingMessages={isLoadingMessages}
            />
        </div>
    );
}