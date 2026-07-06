import Link from 'next/link';
import type { Metadata } from 'next';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Families',
};

const demoFamilies = [
  { id: 'maytalman', name: 'Maytalman Family Archive' },
  { id: 'demo', name: 'Demo Family Workspace' },
];

export default function FamiliesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.24em] text-gold-500">Family switcher</p>
      <h1 className="mt-3 font-display text-4xl text-cream-50">Choose a family workspace</h1>
      <p className="mt-3 max-w-2xl text-warm-white/70">
        These demo entries power the Phase 1 dashboard shell until real family membership APIs
        are connected.
      </p>

      <div className="mt-10 grid gap-4">
        {demoFamilies.map((family) => (
          <Link key={family.id} href={`/family/${family.id}`}>
            <Card className="transition hover:border-gold-500/40 hover:bg-white/5">
              <CardTitle>{family.name}</CardTitle>
              <CardDescription>Open dashboard, timeline, people, and review tools.</CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
