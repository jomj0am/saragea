'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building,
  Users,
  CreditCard,
  Settings,
  Wrench,
  ArrowDownCircle,
  Store,
  MessageCircle,
  Building2,
} from 'lucide-react';
import { ThemeSwitcher } from '../../shared/ThemeSwitcher';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, color: 'text-cyan-400 dark:text-cyan-300' },
  { href: '/admin/properties', label: 'Properties', icon: Building, color: 'text-pink-400 dark:text-pink-300' },
  { href: '/admin/tenants', label: 'Tenants', icon: Users, color: 'text-violet-400 dark:text-violet-300' },
  { href: '/admin/maintenance', label: 'Maintenance', icon: Wrench, color: 'text-orange-400 dark:text-orange-300' },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard, color: 'text-green-400 dark:text-green-300' },
  { href: '/admin/expenses', label: 'Expenses', icon: ArrowDownCircle, color: 'text-yellow-400 dark:text-yellow-300' },
  { href: '/admin/messages', label: 'Messages', icon: MessageCircle, color: 'text-rose-400 dark:text-rose-300' },
  { href: '/admin/vendors', label: 'Vendors', icon: Store, color: 'text-indigo-400 dark:text-indigo-300' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, color: 'text-sky-400 dark:text-sky-300' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        // 🟢 Light mode glass
        'h-full md:flex  flex-col w-72 border-r shadow-[0_0_20px_rgba(0,0,0,0.08)]',
        // 🌑 Dark mode: deep gradient + brighter border
        'bg-gradient-to-b from-background/70 to-background/30 backdrop-blur-xl border-white/10 dark:from-gray-950 dark:to-gray-900 dark:border-gray-800/30'
      )}
    >
      {/* Header */}
      <div className="h-20 border-b border-white/10 dark:border-gray-800 flex items-center justify-between px-6 bg-gradient-to-r from-primary/10 to-transparent dark:from-primary/20">
        <Link href="/admin" className="flex items-center gap-3 group">
          <Building2 className="h-7 w-7 text-primary dark:text-primary-300 group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-lg tracking-wide bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Admin Panel
          </span>
        </Link>
        <ThemeSwitcher />
      </div>

      {/* Nav Links */}
      <nav className="flex-grow p-5">
        <ul className="space-y-2">
          {navItems.map(({ href, label, icon: Icon, color }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 group',
                    active
                      ? 'bg-primary/15 dark:bg-primary/25 text-primary dark:text-primary-300 shadow-[inset_0_0_12px_rgba(0,0,0,0.15)]'
                      : 'hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary/90 dark:hover:text-primary/80 text-muted-foreground dark:text-gray-400'
                  )}
                >
                  <div
                    className={cn(
                      'p-2 rounded-lg bg-gradient-to-br from-background/40 to-background/20 shadow-md group-hover:scale-110 transition-transform',
                      'dark:from-gray-800 dark:to-gray-700',
                      color
                    )}
                  >
                    <Icon className="h-5 w-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]" />
                  </div>
                  <span className="font-medium tracking-wide">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t flex border-slate-200 bg-slate-200/20 dark:bg-slate-800/20 dark:border-gray-800 p-6 text-center items-end text-xs text-muted-foreground gap-6 w-full justify-center dark:text-gray-400">
        <div className="flex flex-col">
          <span className='text-4xl'>🦍</span>
          <span className='text-[8px]'>Powered by</span>
          <span className='text-[11px] text-shadow-sm text-shadow-black'>G-Nexus</span>
        </div>
        <div className="">
           <p className="mb-1">© {new Date().getFullYear()} Estate Admin</p>
           <p className="text-[0.7rem] opacity-70">All systems operational</p>
        </div>
      </div>
    </aside>
  );
}
