"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { type User } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import NewConversationDialog from "./NewConversationDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type ConversationWithDetails,
  type PseudoConversation,
  type SimpleUser,
} from "@/types/messaging";
import { Search, Shield, ShieldCheck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ConversationSidebarProps {
  conversations: ConversationWithDetails[];
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
  currentUser,
}: ConversationSidebarProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  // Note: We don't need router here as we are handling state internally

  if (!currentUser) return null;

  // --- Helper for Tenant -> Admin Chat ---
  const handleContactSupport = async () => {
    setIsConnecting(true);
    try {
      // 1. Get Admin ID
      const res = await fetch("/api/admin-contact");
      if (!res.ok) throw new Error("Support offline");
      const { admin } = await res.json(); // API returns { adminId, admin: { id, name, image } }

      // 2. Pass to parent handler (MessagingInterface)
      // This reuses the same logic as if an Admin selected a Tenant
      onStartNewConversation({
        id: admin.id,
        name: "Administration", // Force name for UI
        image: null,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not connect to support.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // --- Helper to mask identity ---
  const getDisplayInfo = (otherParty: SimpleUser) => {
    if (currentUser.role === "TENANT") {
      return {
        name: "Administration",
        image: null,
        isSystem: true,
      };
    }
    return {
      name: otherParty.name,
      image: otherParty.image,
      isSystem: false,
    };
  };

  return (
    <div className="relative flex flex-col h-full bg-card/50">
      {/* Header & Actions */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Messages</h2>

          {/* --- ROLE BASED BUTTON --- */}
          {currentUser.role === "ADMIN" ? (
            // Admin: Search for any tenant
            <NewConversationDialog
              onConversationSelect={onStartNewConversation}
            />
          ) : (
            // Tenant: One-click connect to Admin
            <Button
              size="sm"
              variant="default"
              onClick={handleContactSupport}
              disabled={isConnecting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-full px-4"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              Contact Support
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            className="pl-9 h-9 bg-background/50 rounded-lg focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-grow">
        <div className="p-3 space-y-1">
          {conversations.length > 0 ? (
            conversations.map((conv) => {
              const otherPartyOriginal = conv.otherParty;
              const { name, image, isSystem } =
                getDisplayInfo(otherPartyOriginal);

              const lastMessage = conv.messages[0];
              const unreadCount = conv._count?.messages || 0;
              const isActive = activeConversation?.id === conv.id;

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className={cn(
                    "flex w-full items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left group",
                    isActive
                      ? "bg-primary/10 hover:bg-primary/15"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm transition-transform group-hover:scale-105">
                      {isSystem ? (
                        <AvatarFallback className="bg-indigo-600 text-white">
                          <Shield className="h-6 w-6" />
                        </AvatarFallback>
                      ) : (
                        <>
                          <AvatarImage src={image || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-bold">
                            {name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    {/* Online Indicator (Mock) */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full ring-1 ring-background"></span>
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p
                        className={cn(
                          "font-semibold text-sm truncate",
                          isActive ? "text-primary" : "text-foreground"
                        )}
                      >
                        {name}
                      </p>
                      {lastMessage && (
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                          {formatDistanceToNow(
                            new Date(lastMessage.createdAt),
                            { addSuffix: false }
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p
                        className={cn(
                          "text-xs truncate max-w-[140px]",
                          unreadCount > 0
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {/* Hide system flags */}
                        {lastMessage?.content === "EXT_INIT_CHAT"
                          ? "Start a conversation"
                          : lastMessage?.content || "No messages yet."}
                      </p>
                      {unreadCount > 0 && (
                        <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shadow-sm animate-in zoom-in">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4 space-y-3">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  No messages yet
                </p>
                {currentUser.role === "TENANT" && (
                  <p className="text-xs text-muted-foreground mt-1 max-w-[150px] mx-auto">
                    Need help? Click the button above to chat with us.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
