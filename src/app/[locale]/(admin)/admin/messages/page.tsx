// Mfano wa app/(admin)/admin/messages/page.tsx
import MessagingInterface from "@/components/messaging/MessagingInterface";
import { MessageSquareText } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="w-full h-[calc(100vh-9rem)]   md:h-[calc(100vh-8rem)] md:p-12">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-2xl md:text-3xl font-bold tracking-tight">
            <div className="relative bg-blue-100/90 rounded-sm shadow-lg shadow-blue-500/70 dark:shadow-blue-700 p-1">
              <MessageSquareText className="h-9 w-9 text-blue-600 dark:text-blue-400" />
            </div>

            <span>
              <h1>Messages</h1>
              <p className="text-[16px] font-light text-muted-foreground">
                Manage conversations with tenants and property managers
              </p>
            </span>
          </div>
        </div>

        <div className=" h-full rounded-2xl overflow-hidden border w-full shadow-sm  mx-auto ">
          <MessagingInterface />
        </div>
      </div>
    </div>
  );
}
