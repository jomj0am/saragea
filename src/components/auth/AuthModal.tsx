// components/auth/AuthModal.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useAuthModalStore } from '@/store/auth-modal-store';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Toaster } from '../ui/sonner';
import { X } from 'lucide-react';

export default function AuthModal() {
  const { isOpen, view, closeModal, switchView } = useAuthModalStore();
  const t = useTranslations('Auth');

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        className="
          w-full h-full sm:h-auto sm:max-w-lg max-w-full
          p-0 overflow-hidden
          bg-gradient-to-br from-white/80 to-white/40
          dark:from-zinc-900/90 dark:to-zinc-800/70
          backdrop-blur-3xl
          border border-white/20 dark:border-zinc-600/30
          shadow-2xl
          rounded-none sm:rounded-3xl
          flex flex-col
        "
      >
        {/* --- Sexy Blur Colored Background Layers --- */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-72 h-72 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-gradient-to-br from-amber-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse delay-2000" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full blur-2xl animate-pulse delay-1000" />
        </div>

                {/* Custom Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => closeModal()}
                  className="
                    absolute top-3 right-4 z-20
                    rounded-full p-2
                    bg-white dark:bg-zinc-800 shadow
                    backdrop-blur-2xl
                    hover:scale-110 transition
                  "
                >
                  <X className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
                </Button>

        {/* Gradient header */}
        <DialogHeader className="text-center px-6 pt-8 pb-4 relative z-10">
          <DialogTitle
            className="
              text-3xl sm:text-4xl font-extrabold tracking-tight
              bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500
              bg-clip-text text-transparent
            "
          >
            {view === 'login' ? t('loginTitle') : t('registerTitle')}
          </DialogTitle>
          <DialogDescription className="mt-2 text-base sm:text-lg text-muted-foreground">
            {view === 'login' ? t('loginSubtitle') : t('registerSubtitle')}
          </DialogDescription>
        </DialogHeader>

        {/* Toast notifications */}
        <Toaster />

        {/* Form area */}
        <div className="relative flex-1 px-6 sm:px-8 pb-6 overflow-y-auto z-10">
          {view === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>

        {/* Switch view footer */}
        <div className="relative z-10 px-6 sm:px-8 py-4 border-t border-white/10 text-center text-sm bg-white/10 backdrop-blur-sm">
          {view === 'login' ? t('loginPrompt') : t('registerPrompt')}{' '}
          <Button
            variant="link"
            onClick={() =>
              switchView(view === 'login' ? 'register' : 'login')
            }
            className="p-0 h-auto font-semibold text-indigo-500 hover:text-indigo-600"
          >
            {view === 'login' ? t('loginAction') : t('registerAction')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
