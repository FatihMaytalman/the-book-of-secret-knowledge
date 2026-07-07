import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { fetchFamily } from '@/lib/api';

interface FamilyLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function FamilyLayout({ children, params }: FamilyLayoutProps) {
  const { id } = await params;

  let familyName: string;
  try {
    const family = await fetchFamily(id);
    familyName = family.name;
  } catch {
    notFound();
  }

  return (
    <AppShell familyId={id} familyName={familyName}>
      {children}
    </AppShell>
  );
}
