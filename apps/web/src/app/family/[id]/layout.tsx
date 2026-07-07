import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';

const demoFamilies: Record<string, string> = {
  maytalman: 'Maytalman Family Archive',
  demo: 'Demo Family Workspace',
};

interface FamilyLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function FamilyLayout({ children, params }: FamilyLayoutProps) {
  const { id } = await params;
  const familyName = demoFamilies[id];

  if (!familyName) {
    notFound();
  }

  return (
    <AppShell familyId={id} familyName={familyName}>
      {children}
    </AppShell>
  );
}

export function generateStaticParams() {
  return Object.keys(demoFamilies).map((id) => ({ id }));
}
