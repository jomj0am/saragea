"use client";

import { useEffect, useState } from "react";
import { type User } from "@prisma/client";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onConversationSelect: (tenant: User) => void;
}

export default function NewConversationDropdown({
  onConversationSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const [tenants, setTenants] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    fetch("/api/tenants")
      .then((res) => res.json())
      .then(setTenants)
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <div className="absolute bottom-0 w-full left-0 p-4 flex justify-center">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="
              z-50
              w-[98%] max-w-sm
              flex items-center justify-center gap-3
              rounded-2xl
              bg-gradient-to-r from-purple-400/90 to-pink-500/90
              px-6 py-4
              text-sm font-semibold text-white
              shadow-lg shadow-purple-500/30
              transition-all duration-300
              hover:scale-[1.02] hover:shadow-xl
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-purple-400/50
            "
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
              <Plus className="h-5 w-5" />
            </span>
            <span>New Conversation</span>
          </button>
        </DropdownMenuTrigger>

        <AnimatePresence>
          <DropdownMenuContent
            side="top"
            align="center"
            sideOffset={12}
            forceMount
            asChild
            className="
              w-[360px]
              rounded-2xl
              border border-zinc-200/30
              bg-background/80 dark:bg-zinc-900/70
              backdrop-blur-xl
              shadow-2xl
              p-2
            "
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="px-3 py-2">
                <p className="text-sm font-semibold">
                  Start a new conversation
                </p>
                <p className="text-xs text-muted-foreground">
                  Choose a tenant to chat with
                </p>
              </div>

              <Command className="rounded-xl border-none">
                <CommandInput placeholder="Search tenants…" />
                <CommandList>
                  {loading && (
                    <p className="px-4 py-3 text-sm text-muted-foreground">
                      Loading tenants…
                    </p>
                  )}

                  <CommandEmpty>No tenants found.</CommandEmpty>

                  <CommandGroup>
                    {tenants.map((tenant) => (
                      <CommandItem
                        key={tenant.id}
                        onSelect={() => {
                          onConversationSelect(tenant);
                          setOpen(false);
                        }}
                        className="
                          rounded-xl
                          px-3 py-2
                          cursor-pointer
                          transition-colors
                          hover:bg-orange-500/10
                        "
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {tenant.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {tenant.email}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </motion.div>
          </DropdownMenuContent>
        </AnimatePresence>
      </DropdownMenu>
    </div>
  );
}
