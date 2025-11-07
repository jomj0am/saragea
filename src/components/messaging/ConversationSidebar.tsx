// components/messaging/ConversationSidebar.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { type User } from "@prisma/client";
import { formatDistanceToNow } from 'date-fns';
import NewConversationDialog from "./NewConversationDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    type ConversationWithDetails, 
    type PseudoConversation,
    type SimpleUser 
} from "@/types/messaging"; // Import 'types' zetu

// Sakinisha: npx shadcn-ui@latest add scroll-area

// --- REKEBISHO #1: Tumia 'Types' Sahihi kwenye Props ---
interface ConversationSidebarProps {
    conversations: ConversationWithDetails[];
    // Mazungumzo yanayoendelea yanaweza kuwa ya kweli au ya muda
    activeConversation: ConversationWithDetails | PseudoConversation | null;
    onSelectConversation: (conversation: ConversationWithDetails) => void;
    onStartNewConversation: (tenant: SimpleUser) => void;
    currentUser: User;
}

export default function ConversationSidebar({ 
    conversations, 
    activeConversation, 
    onSelectConversation, 
    onStartNewConversation, 
    currentUser 
}: ConversationSidebarProps) {
    
    // Ulinzi: Kama 'currentUser' haipo, usionyeshe chochote
    if (!currentUser) return null;

    return (
        <div className="w-full md:w-[350px] border-r h-full flex flex-col bg-card">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold">Chats</h2>
            </div>
            
            {/* Kitufe cha Kuanzisha Mazungumzo (kwa Admin tu) */}
            {currentUser.role === 'ADMIN' && (
                <div className="p-2 border-b">
                    <NewConversationDialog onConversationSelect={onStartNewConversation} />
                </div>
            )}

            {/* Orodha ya Mazungumzo */}
            <ScrollArea className="flex-grow">
                <div className="flex flex-col">
                    {conversations.length > 0 ? conversations.map(conv => {
                        // --- REKEBISHO #2: 'otherParty' tayari ipo kwenye data ---
                        // Hakuna haja ya 'getOtherParty' function tena
                        const otherParty = conv.otherParty;
                        const lastMessage = conv.messages[0];
                        const unreadCount = conv._count?.messages || 0;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => onSelectConversation(conv)}
                                className={cn(
                                    "flex items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b",
                                    { "bg-muted": activeConversation?.id === conv.id }
                                )}
                            >
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={otherParty.image || undefined} />
                                    <AvatarFallback>{otherParty.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 flex-grow overflow-hidden">
                                    <p className="font-semibold truncate">{otherParty.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {lastMessage?.content || 'No messages yet.'}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 flex flex-col items-end text-xs text-muted-foreground ml-2">
                                    {lastMessage && (
                                        <time dateTime={new Date(lastMessage.createdAt).toISOString()}>
                                            {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                                        </time>
                                    )}
                                    {unreadCount > 0 && (
                                        <span className="mt-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    }) : (
                        <p className="p-4 text-center text-muted-foreground">
                            {currentUser.role === 'ADMIN' ? "No active conversations. Start a new one." : "Your conversation with the admin will appear here."}
                        </p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}