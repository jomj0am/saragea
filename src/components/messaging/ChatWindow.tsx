"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Send,
  Loader2,
  ArrowLeft,
  MoreVertical,
  Shield,
  Smile,
  Paperclip,
  Mic,
  Check,
  CheckCheck,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type ConversationWithDetails,
  type MessageWithSender,
  type PseudoConversation,
} from "@/types/messaging";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

interface ChatWindowProps {
  conversation: ConversationWithDetails | PseudoConversation | null;
  messages: MessageWithSender[];
  onSendMessage: (content: string) => Promise<void>;
  isLoadingMessages: boolean;
  onBack: () => void;
}

export default function ChatWindow({
  conversation,
  messages,
  onSendMessage,
  isLoadingMessages,
  onBack,
}: ChatWindowProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation]);

  useEffect(() => {
    if (isAtBottom && viewportRef.current) {
      viewportRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoadingMessages, isAtBottom]);

  const handleScroll = () => {
    if (!scrollAreaRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const isScrolledToBottom =
      Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
    setIsAtBottom(isScrolledToBottom);
  };

  const scrollToBottom = () => {
    viewportRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
  };

  if (!conversation) return null;

  const isTenant = session?.user?.role === "TENANT";

  const headerInfo = isTenant
    ? {
        name: "Administration",
        image: null,
        isSystem: true,
        status: "Support Team",
        role: "Verified System",
      }
    : {
        name: conversation.otherParty.name ?? "Unknown User",
        image: conversation.otherParty.image,
        isSystem: false,
        status: "Online",
        role: "Resident",
      };

  const handleSend = async () => {
    if (!content.trim() || isSending) return;
    setIsSending(true);
    await onSendMessage(content);
    setContent("");
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full  bg-gradient-to-br from-background via-background to-muted/20 rounded-xl shadow-2xl border border-border/50 overflow-hidden group">
      {/* Header - Enhanced with gradient and glass effect */}
      <div className="sticky top-0 z-30 h-20 px-6 flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-background/95 via-background/90 to-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden -ml-2 hover:bg-primary/10 transition-all duration-200 hover:scale-105"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="relative">
            <Avatar className="h-11 w-11 ring-2 ring-border/50 shadow-lg">
              {headerInfo.isSystem ? (
                <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                  <Shield className="h-5 w-5" />
                </AvatarFallback>
              ) : (
                <>
                  <AvatarImage src={headerInfo.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white">
                    {headerInfo.name.charAt(0)}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            {!headerInfo.isSystem && (
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500"></div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold leading-none tracking-tight">
                {headerInfo.name}
              </p>
              {headerInfo.isSystem && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
                  VERIFIED
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full animate-pulse",
                  headerInfo.isSystem ? "bg-indigo-500" : "bg-emerald-500"
                )}
              />
              {headerInfo.status}
              {!headerInfo.isSystem && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-muted-foreground/70">
                    {headerInfo.role}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary/10 transition-all duration-200"
          >
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Messages Area - Fixed height with scroll */}
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 px-4 py-6 min-h-0"
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto space-y-3 relative">
          {isLoadingMessages ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-2 border-transparent border-t-primary/30 border-r-primary/30 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">
                  Loading messages...
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4 shadow-inner">
                <Shield className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Start a conversation
              </p>
              <p className="text-xs text-muted-foreground/70 max-w-sm">
                Send your first message to {headerInfo.name.toLowerCase()}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/60">
                <Check className="h-3 w-3" />
                <span>End-to-end encrypted</span>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => {
                const isMe = msg.senderId === session?.user?.id;
                const prev = messages[i - 1];
                const next = messages[i + 1];
                const showAvatar =
                  !isMe && (!prev || prev.senderId !== msg.senderId);
                const showTimeSeparator =
                  !prev ||
                  new Date(msg.createdAt).getDate() !==
                    new Date(prev.createdAt).getDate();

                return (
                  <div key={msg.id}>
                    {showTimeSeparator && (
                      <div className="flex items-center justify-center my-6">
                        <div className="px-3 py-1.5 text-xs font-medium bg-muted/50 text-muted-foreground rounded-full">
                          {format(new Date(msg.createdAt), "MMM d, yyyy")}
                        </div>
                      </div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.2,
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      className={cn(
                        "flex w-full group/message",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "flex gap-2 max-w-[75%] relative",
                          isMe && "flex-row-reverse"
                        )}
                      >
                        {!isMe && (
                          <div className="w-8 flex-shrink-0">
                            {showAvatar && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                <Avatar className="h-8 w-8 shadow-sm border">
                                  <AvatarImage
                                    src={msg.sender.image || undefined}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {(msg.sender.name ?? "U")[0]}
                                  </AvatarFallback>
                                </Avatar>
                              </motion.div>
                            )}
                          </div>
                        )}

                        <div className="relative">
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-3 text-sm shadow-sm",
                              "transition-all duration-200",
                              isMe
                                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm shadow-lg"
                                : "bg-background border shadow-sm rounded-tl-sm hover:bg-muted/30"
                            )}
                          >
                            <div className="whitespace-pre-wrap break-words leading-relaxed">
                              {msg.content}
                            </div>
                            <div
                              className={cn(
                                "flex items-center justify-end gap-1 mt-1.5 text-[10px]",
                                isMe
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              )}
                            >
                              {format(new Date(msg.createdAt), "h:mm a")}
                              {isMe && (
                                <div className="flex items-center ml-1">
                                  <CheckCheck className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Message options on hover */}
                          <div
                            className={cn(
                              "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200",
                              isMe ? "-left-12" : "-right-12"
                            )}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={viewportRef} className="h-px" />
        </div>
      </ScrollArea>

      {/* Scroll to bottom button */}
      {!isAtBottom && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2"
        >
          <Button
            onClick={scrollToBottom}
            size="sm"
            className="rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-4 py-2 text-xs font-medium backdrop-blur-sm"
          >
            <ArrowLeft className="h-3 w-3 mr-1 rotate-90" />
            New messages
          </Button>
        </motion.div>
      )}

      {/* Input Area - Enhanced with more options */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl p-4 relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="h-1 w-16 rounded-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-end gap-2">
            <div className="flex items-center gap-1 flex-1 bg-background border border-border/50 rounded-2xl pl-4 pr-2 py-2 shadow-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted"
                    >
                      <Smile className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Emoji</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted"
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Input
                ref={inputRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${headerInfo.name}...`}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent min-h-[40px] px-2 placeholder:text-muted-foreground/60"
                disabled={"isPseudo" in conversation && messages.length > 0}
              />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted"
                    >
                      <Mic className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Voice message</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    type="submit"
                    disabled={!content.trim() || isSending}
                    className="h-12 w-12 rounded-full shadow-lg bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5 ml-0.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send message</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </form>
      </div>
    </div>
  );
}
