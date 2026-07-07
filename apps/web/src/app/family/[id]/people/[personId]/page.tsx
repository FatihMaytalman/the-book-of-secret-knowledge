import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { fetchPerson } from '@/lib/api';

interface PersonPageProps {
  params: Promise<{ id: string; personId: string }>;
}

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const { personId } = await params;
  try {
    const person = await fetchPerson(personId);
    return { title: person.displayName };
  } catch {
    return { title: 'Person' };
  }
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id, personId } = await params;

  let person;
  try {
    person = await fetchPerson(personId);
  } catch {
    notFound();
  }

  const facts: Array<{ label: string; value: string }> = [
    { label: 'Status', value: person.isLiving ? 'Living' : 'Deceased' },
    { label: 'Born', value: person.birthDate ?? '—' },
    { label: 'Died', value: person.deathDate ?? '—' },
    { label: 'Visibility', value: person.visibility },
  ];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/family/${id}/people`}
          className="text-xs uppercase tracking-[0.24em] text-gold-500"
        >
          ← People
        </Link>
        <h2 className="mt-3 font-display text-4xl text-cream-50">{person.displayName}</h2>
      </div>

      <Card>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Attached media, life events, stories, and relationships will build on this profile.
        </CardDescription>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <dt className="text-xs uppercase tracking-[0.18em] text-turquoise-500">
                {fact.label}
              </dt>
              <dd className="mt-1 text-cream-50">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
