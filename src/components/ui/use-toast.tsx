// src/components/ui/use-toast.ts
"use client"

import * as React from "react"
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  duration?: number
}

type ToastContextType = {
  toast: (props: ToastProps) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
)

export function ToastProviderWrapper({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    setToasts((prev) => [...prev, props])
    setTimeout(() => {
      setToasts((prev) => prev.slice(1))
    }, props.duration ?? 3000)
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastProvider>
        {children}
        {toasts.map((t, i) => (
          <Toast key={i} variant={t.variant}>
            <div className="grid gap-1">
              {t.title && <div className="font-semibold">{t.title}</div>}
              {t.description && (
                <div className="text-sm opacity-90">{t.description}</div>
              )}
            </div>
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a <ToastProviderWrapper>")
  }
  return context
}
