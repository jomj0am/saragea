// components/messaging/ChatWindow.tsx
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    type ConversationWithDetails, 
    type MessageWithSender,
    type PseudoConversation,
} from '@/types/messaging'; // Import 'types' zetu
import { cn } from '@/lib/utils';

// --- REKEBISHO #1: Tumia 'Types' Sahihi kwenye Props ---
interface ChatWindowProps {
    conversation: ConversationWithDetails | PseudoConversation | null;
    messages: MessageWithSender[];
    onSendMessage: (content: string) => Promise<void>;
    isLoadingMessages: boolean;
}

export default function ChatWindow({ conversation, messages, onSendMessage, isLoadingMessages }: ChatWindowProps) {
    const { data: session } = useSession();
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const viewportRef = useRef<HTMLDivElement>(null); // Ref kwa ajili ya ScrollArea

    // Auto-scroll to bottom
    useEffect(() => {
        // Tumia 'setTimeout' ili kutoa muda kwa UI ku-render kabla ya ku-scroll
        setTimeout(() => {
            viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
    }, [messages]);

    const handleSendMessage = async () => {
        if (!content.trim() || isSending) return;
        setIsSending(true);
        try {
            await onSendMessage(content);
            setContent('');
        } finally {
            setIsSending(false);
        }
    };

    // --- REKEBISHO #2: UI ya 'Empty State' iliyoboreshwa ---
    if (!conversation) {
        return (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center h-full text-muted-foreground bg-secondary/40 p-8 text-center">
                <div className="w-24 h-24 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50">
                        <path d="M12 22a10 10 0 1 0-10-10c0 2.22.77 4.27 2.1 5.84.54.63 1.2 1.15 1.9 1.54"/>
                        <path d="M12 18a6 6 0 1 0-6-6c0 1.66.67 3.16 1.76 4.24.48.51.98.92 1.54 1.22"/>
                    </svg>
                </div>
                <h3 className="text-xl font-semibold">Welcome to your Inbox</h3>
                <p className="max-w-xs">Select a conversation from the sidebar to view messages or start a new one.</p>
            </div>
        );
    }
    
    // --- REKEBISHO #3: 'otherParty' inapatikana moja kwa moja ---
    const otherParty = conversation.otherParty;

    return (
        <div className="flex flex-1 flex-col h-full bg-background">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={otherParty.image || undefined} />
                    <AvatarFallback>{otherParty.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{otherParty.name}</h3>
            </div>

            {/* Orodha ya Meseji */}
            <ScrollArea className="flex-1 p-6" >
                <div ref={viewportRef} className="space-y-6">
                    {isLoadingMessages ? (
                        <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className={cn("flex items-end gap-3", { "justify-end": msg.senderId === session?.user?.id })}>
                                {msg.senderId !== session?.user?.id && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={msg.sender.image || undefined} />
                                        <AvatarFallback>{msg.sender.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("max-w-xs lg:max-w-md p-3 rounded-lg shadow-sm", { "bg-primary text-primary-foreground": msg.senderId === session?.user?.id, "bg-muted": msg.senderId !== session?.user?.id })}>
                                    <p className="text-sm break-words">{msg.content}</p>
                                    <p className="text-xs text-right mt-1 opacity-70">{format(new Date(msg.createdAt), 'p')}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Fomu ya Kutuma Ujumbe */}
            <div className="p-4 border-t bg-secondary/50">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                    <Input 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                        placeholder="Type a message..." 
                        autoComplete="off" 
                        disabled={'isPseudo' in conversation && messages.length > 0} // Zuia kuandika kabla ya ujumbe wa kwanza kufika
                    />
                    <Button type="submit" disabled={isSending || !content.trim()}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}