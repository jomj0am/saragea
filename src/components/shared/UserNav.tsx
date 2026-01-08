// components/shared/UserNav.tsx
"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserNav() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const userInitial = session.user.name?.charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full p-0 overflow-hidden hover:scale-105 transition-transform"
        >
          <Avatar className="h-10 w-10 ring-2 ring-transparent hover:ring-indigo-400 transition-all duration-300">
            <AvatarImage
              src={session.user.image || ""}
              alt={session.user.name || ""}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold">
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <AnimatePresence>
        <DropdownMenuContent
          align="end"
          forceMount
          asChild
          className="w-64 rounded-2xl border border-zinc-200/30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-2xl p-2"
        >
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <DropdownMenuLabel className="font-normal pb-2 border-b border-zinc-200/40 dark:border-zinc-700/40">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={session.user.image || ""}
                    alt={session.user.name || ""}
                  />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuGroup className="py-2">
              <Link href="/dashboard">
                <DropdownMenuItem className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 cursor-pointer transition-all">
                  <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/profile">
                <DropdownMenuItem className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 cursor-pointer transition-all">
                  <User className="h-4 w-4 text-purple-500" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-red-500 hover:bg-red-500/10 cursor-pointer transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </motion.div>
        </DropdownMenuContent>
      </AnimatePresence>
    </DropdownMenu>
  );
}
