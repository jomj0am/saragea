"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getPusherClient } from "@/lib/pusher";
import ConversationSidebar from "./ConversationSidebar";
import ChatWindow from "./ChatWindow";
import { Loader2, MessageSquareDashed } from "lucide-react";
import { type User } from "@prisma/client";
import {
  type ConversationWithDetails,
  type MessageWithSender,
  type PseudoConversation,
  type SimpleUser,
} from "@/types/messaging";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";

export default function MessagingInterface() {
  const { data: session, status: sessionStatus } = useSession();
  const currentUser = session?.user as User;
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const startWithAdminId = searchParams.get("startWith");

  const [conversations, setConversations] = useState<ConversationWithDetails[]>(
    []
  );
  const [activeConversation, setActiveConversation] = useState<
    ConversationWithDetails | PseudoConversation | null
  >(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Mobile View State
  const [showSidebar, setShowSidebar] = useState(true);

  // --- ✅ MOVED UP: Handlers defined first ---

  const handleSelectConversation = useCallback(
    async (conv: ConversationWithDetails) => {
      setActiveConversation(conv);
      setShowSidebar(false);
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`/api/conversations/${conv.id}/messages`);
        const data: MessageWithSender[] = await res.json();
        setMessages(data);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conv.id ? { ...c, _count: { messages: 0 } } : c
          )
        );
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load messages.",
        });
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [toast]
  );

  const handleStartNewConversation = useCallback(
    async (tenant: SimpleUser) => {
      const existingConv = conversations.find(
        (c) => c.otherParty.id === tenant.id
      );
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
      setShowSidebar(false);
    },
    [conversations, handleSelectConversation]
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeConversation) return;

      const payload = {
        content,
        conversationId:
          "isPseudo" in activeConversation ? null : activeConversation.id,
        recipientId:
          "isPseudo" in activeConversation
            ? activeConversation.otherParty.id
            : null,
      };

      const optimisticMessage: MessageWithSender = {
        id: `optimistic-${Date.now()}`,
        content,
        createdAt: new Date(),
        senderId: currentUser.id,
        sender: {
          id: currentUser.id,
          name: currentUser.name,
          image: currentUser.image,
        },
        isRead: false,
        conversationId:
          "isPseudo" in activeConversation ? "" : activeConversation.id,
      };
      setMessages((current) => [...current, optimisticMessage]);

      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to send message");
        const newMessage: MessageWithSender = await response.json();

        if ("isPseudo" in activeConversation) {
          const convRes = await fetch("/api/conversations");
          const newConversations: ConversationWithDetails[] =
            await convRes.json();
          setConversations(newConversations);
          const newActiveConv = newConversations.find(
            (c) => c.id === newMessage.conversationId
          );
          if (newActiveConv) setActiveConversation(newActiveConv);
        }

        setMessages((current) =>
          current.map((m) => (m.id === optimisticMessage.id ? newMessage : m))
        );
      } catch {
        toast({
          variant: "destructive",
          title: "Message Failed",
          description: "Your message could not be sent.",
        });
        setMessages((current) =>
          current.filter((m) => m.id !== optimisticMessage.id)
        );
      }
    },
    [activeConversation, currentUser, toast]
  );

  const handleBackToSidebar = () => {
    setShowSidebar(true);
    setActiveConversation(null);
  };

  // --- ✅ MOVED DOWN: Effects use handlers ---

  // Fetch conversations
  useEffect(() => {
    if (currentUser?.id) {
      setIsLoadingConversations(true);
      fetch("/api/conversations")
        .then((res) => res.json())
        .then(async (data: ConversationWithDetails[]) => {
          setConversations(data);

          // Logic 1: If coming from "Contact Support" button
          if (startWithAdminId) {
            const targetConv = data.find(
              (c) => c.otherParty.id === startWithAdminId
            );
            if (targetConv) {
              handleSelectConversation(targetConv);
            } else {
              // Conversation doesn't exist yet, create a Pseudo one
              setActiveConversation({
                id: `new-${startWithAdminId}`,
                otherParty: {
                  id: startWithAdminId,
                  name: "Administration",
                  image: null,
                },
                isPseudo: true,
              });
              setShowSidebar(false);
            }
          }
          // Logic 2: Default behavior for Tenants (open first chat if no param)
          else if (data.length > 0 && currentUser.role === "TENANT") {
            handleSelectConversation(data[0]);
          }
        })
        .catch(() =>
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load conversations.",
          })
        )
        .finally(() => setIsLoadingConversations(false));
    }
  }, [currentUser, startWithAdminId, toast, handleSelectConversation]);

  // Real-time updates
  useEffect(() => {
    if (!activeConversation?.id || "isPseudo" in activeConversation) return;

    const pusherClient = getPusherClient();
    if (!pusherClient) return;

    pusherClient.subscribe(activeConversation.id);

    const messageHandler = (newMessage: MessageWithSender) => {
      if (newMessage.senderId !== currentUser?.id) {
        setMessages((current) => [...current, newMessage]);

        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === newMessage.conversationId
              ? {
                  ...c,
                  messages: [newMessage],
                  updatedAt: newMessage.createdAt,
                }
              : c
          );
          return updated.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
      }
    };
    pusherClient.bind("messages:new", messageHandler);

    return () => {
      if (activeConversation?.id) {
        pusherClient.unsubscribe(activeConversation.id);
        pusherClient.unbind("messages:new", messageHandler);
      }
    };
  }, [activeConversation, currentUser]);

  if (sessionStatus === "loading" || isLoadingConversations) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background overflow-hidden relative">
      <div
        className={`
                ${showSidebar ? "flex" : "hidden"} 
                md:flex w-full md:w-80 lg:w-96 flex-col border-r border-border
            `}
      >
        <ConversationSidebar
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          onStartNewConversation={handleStartNewConversation}
          currentUser={currentUser}
        />
      </div>

      <div
        className={`
                ${!showSidebar ? "flex" : "hidden"} 
                md:flex flex-1 flex-col bg-slate-50/50 dark:bg-zinc-900/50
            `}
      >
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoadingMessages={isLoadingMessages}
            onBack={handleBackToSidebar}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageSquareDashed className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Chat Selected</h3>
            <p className="max-w-xs">
              Choose a conversation from the sidebar to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
