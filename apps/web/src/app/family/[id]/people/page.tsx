import type { Metadata } from 'next';
import { PeopleManager } from '@/components/people/people-manager';

export const metadata: Metadata = {
  title: 'People',
};

interface PeoplePageProps {
  params: Promise<{ id: string }>;
}

export default async function PeoplePage({ params }: PeoplePageProps) {
  const { id } = await params;

  return <PeopleManager familyId={id} />;
}
