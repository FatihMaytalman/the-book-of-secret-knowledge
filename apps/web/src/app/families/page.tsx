import type { Metadata } from 'next';
import { FamiliesManager } from '@/components/families/families-manager';

export const metadata: Metadata = {
  title: 'Families',
};

export default function FamiliesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.24em] text-gold-500">Family switcher</p>
      <h1 className="mt-3 font-display text-4xl text-cream-50">Choose a family workspace</h1>
      <p className="mt-3 max-w-2xl text-warm-white/70">
        Open an existing family workspace or create a new one. Workspaces are backed by the
        Kinvault API.
      </p>

      <FamiliesManager />
    </div>
  );
}
