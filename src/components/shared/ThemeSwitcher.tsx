// components/shared/ThemeSwitcher.tsx
"use client"

import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const items = [
    { label: "Light", icon: Sun, value: "light" },
    { label: "Dark", icon: Moon, value: "dark" },
    { label: "System", icon: Laptop, value: "system" },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === "light" ? (
              <motion.span
                key="sun"
                initial={{ y: -10, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 10, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.25 }}
              >
                <Sun className="h-[1.3rem] w-[1.3rem] text-amber-500" />
              </motion.span>
            ) : theme === "dark" ? (
              <motion.span
                key="moon"
                initial={{ y: -10, opacity: 0, rotate: 90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 10, opacity: 0, rotate: -90 }}
                transition={{ duration: 0.25 }}
              >
                <Moon className="h-[1.3rem] w-[1.3rem] text-indigo-400" />
              </motion.span>
            ) : (
              <motion.span
                key="system"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Laptop className="h-[1.3rem] w-[1.3rem] text-slate-500" />
              </motion.span>
            )}
          </AnimatePresence>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="mt-2 min-w-[150px] rounded-2xl border border-zinc-200/6 !bg-white/50 dark:!bg-zinc-900/50 backdrop-blur-xl shadow-xl p-2"
      >
        {items.map(({ label, icon: Icon, value }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer transition-all hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-amber-500/10 focus:bg-zinc-100 dark:focus:bg-zinc-800"
          >
            <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
