import type { Metadata } from 'next';
import { PlaceholderPanel } from '@/components/layout/placeholder-panel';

interface PersonPageProps {
  params: Promise<{ id: string; personId: string }>;
}

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const { personId } = await params;
  return {
    title: `Person · ${personId}`,
  };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { personId } = await params;

  return (
    <PlaceholderPanel
      title={`Person profile · ${personId}`}
      description="Attached media, life events, stories, and provenance will appear here."
    />
  );
}
