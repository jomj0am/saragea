'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/admin/shared/Sidebar';
import MobileNav from '@/components/admin/shared/MobileNav';
import { ToastProviderWrapper } from '@/components/ui/use-toast';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      {/* Mobile top bar */}
      <MobileNav />

      <div className="flex flex-1">
        {/* 🟢 Sidebar fixed height + its own scroll, never moves with page */}
        <aside className="hidden lg:block sticky top-0 h-screen">
          <Sidebar />
        </aside>

        {/* Main content scrolls independently */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 py-7 md:p-8">
            <ToastProviderWrapper>{children}</ToastProviderWrapper>
          </div>
        </main>
      </div>
    </div>
  );
}
