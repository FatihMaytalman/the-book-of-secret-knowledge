import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { fetchFamily, TOKEN_KEY } from '@/lib/api';

interface FamilyLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function FamilyLayout({ children, params }: FamilyLayoutProps) {
  const { id } = await params;
  const token = (await cookies()).get(TOKEN_KEY)?.value;

  if (!token) {
    redirect('/login');
  }

  let familyName: string;
  try {
    const family = await fetchFamily(id, token);
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
