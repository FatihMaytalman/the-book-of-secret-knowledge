import Link from 'next/link';
import type { ReactNode } from 'react';
import { SidebarNav } from './sidebar-nav';

interface AppShellProps {
  familyId: string;
  familyName: string;
  children: ReactNode;
}

export function AppShell({ familyId, familyName, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(201,168,76,0.12),_transparent_45%),linear-gradient(180deg,#0d1b2a_0%,#1a1a2e_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-white/10 px-6 py-6 lg:w-72 lg:border-b-0 lg:border-r">
          <div className="mb-8">
            <Link href="/families" className="text-xs uppercase tracking-[0.24em] text-gold-500">
              Bizimkiler
            </Link>
            <h1 className="mt-2 font-display text-2xl text-cream-50">{familyName}</h1>
            <p className="mt-1 text-sm text-warm-white/60">Private family archive</p>
          </div>
          <SidebarNav familyId={familyId} />
        </aside>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
