"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ContactAdminButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleContact = async () => {
    setIsLoading(true);
    try {
      // 1. Get the Admin ID
      const res = await fetch("/api/admin-contact");
      if (!res.ok) throw new Error("Support system offline");
      const { adminId } = await res.json();

      // 2. We don't need to create the conversation manually here.
      // We just push to the messages page with a query param
      // The MessagingInterface will handle the visual setup.

      // However, to ensure the chat exists in the list, let's send a "hello" or init check
      // For now, let's use a simpler approach: Just go to messages.
      // But we need to tell MessagingInterface who to talk to.

      // Let's create the conversation shell if it doesn't exist
      const initRes = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: adminId,
          content: "EXT_INIT_CHAT", // Special flag or just handle empty in backend if modified
        }),
      });

      // Actually, simplified: Just let the user go to messages page.
      // But to make it "Auto Select", we ideally pass a param.

      router.push(`/dashboard/messages?startWith=${adminId}`);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not connect to administration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleContact}
      disabled={isLoading}
      className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg rounded-full"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ShieldCheck className="mr-2 h-4 w-4" />
      )}
      Contact Support
    </Button>
  );
}
