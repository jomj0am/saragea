"use client";

import { useState, useEffect, JSX } from "react";
import {
  Bell,
  Info,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getPusherClient } from "@/lib/pusher";
import { useSession } from "next-auth/react";
import { type Notification, NotificationType } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const iconMap: Record<NotificationType, JSX.Element> = {
  SUCCESS: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  WARNING: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  MESSAGE: <MessageSquare className="h-4 w-4 text-sky-500" />,
  ERROR: <AlertTriangle className="h-4 w-4 text-red-500" />,
  INFO: <Info className="h-4 w-4 text-indigo-500" />,
};

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
      });
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(`user-${session.user.id}`);

    channel.bind("notification:new", (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      pusher.unsubscribe(`user-${session.user.id}`);
    };
  }, [session?.user?.id]);

  const markAllRead = async () => {
    if (!unreadCount) return;
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/notifications", { method: "PATCH" });
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) markAllRead();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative rounded-full hover:bg-muted/60 bg-background/60 border shadow-md"
        >
          <Bell className="h-5 w-5 fill-amber-100 text-amber-400" />

          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-blue-600" />
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="
          w-[380px]
          p-0
          rounded-2xl
          border border-zinc-200/30
          bg-background/80 dark:bg-zinc-900/80
          backdrop-blur-xl
          shadow-2xl
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="h-[420px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                You’re all caught up ✨
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              <AnimatePresence initial={false}>
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Link
                      href={notif.link || "#"}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex gap-3 rounded-xl px-3 py-3 transition-colors",
                        notif.isRead
                          ? "hover:bg-muted/50"
                          : "bg-blue-50/60 dark:bg-blue-900/10 hover:bg-blue-100/60"
                      )}
                    >
                      <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-background border shadow-sm">
                        {iconMap[notif.type]}
                      </div>

                      <div className="flex-1 space-y-1">
                        <p
                          className={cn(
                            "text-sm leading-tight",
                            !notif.isRead && "font-medium text-primary"
                          )}
                        >
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70">
                          {formatDistanceToNow(new Date(notif.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>

                      {!notif.isRead && (
                        <span className="mt-2 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
