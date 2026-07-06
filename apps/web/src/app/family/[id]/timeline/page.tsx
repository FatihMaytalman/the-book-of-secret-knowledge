import type { Metadata } from 'next';
import { PlaceholderPanel } from '@/components/layout/placeholder-panel';

export const metadata: Metadata = {
  title: 'Timeline',
};

export default function TimelinePage() {
  return (
    <PlaceholderPanel
      title="Family timeline"
      description="Chronological memory stream with filters by person, location, event, and media type."
    />
  );
}
