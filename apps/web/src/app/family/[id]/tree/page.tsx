import type { Metadata } from 'next';
import { TreePageClient } from '@/components/tree/tree-page-client';

export const metadata: Metadata = {
  title: 'Family Tree',
};

interface TreePageProps {
  params: Promise<{ id: string }>;
}

export default async function TreePage({ params }: TreePageProps) {
  const { id } = await params;
  return <TreePageClient familyId={id} />;
}
