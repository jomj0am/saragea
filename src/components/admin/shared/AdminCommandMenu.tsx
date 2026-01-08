"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Building,
  Users,
  Wrench,
  CreditCard,
  LayoutDashboard,
  Settings,
} from "lucide-react";

export function AdminCommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <div
        className="hidden md:flex items-center text-sm text-muted-foreground border rounded-lg px-3 py-1.5 bg-muted/30 cursor-pointer hover:bg-muted/50 transition"
        onClick={() => setOpen(true)}
      >
        <span className="mr-2">Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/admin"))}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/admin/properties"))
              }
            >
              <Building className="mr-2 h-4 w-4" />
              Properties
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/admin/tenants"))}
            >
              <Users className="mr-2 h-4 w-4" />
              Tenants
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/admin/maintenance"))
              }
            >
              <Wrench className="mr-2 h-4 w-4" />
              Maintenance
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/admin/payments"))}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Financials
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/admin/settings"))}
            >
              <Settings className="mr-2 h-4 w-4" />
              System Configuration
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
