import type { Metadata } from 'next';
import { PlaceholderPanel } from '@/components/layout/placeholder-panel';

export const metadata: Metadata = {
  title: 'People',
};

export default function PeoplePage() {
  return (
    <PlaceholderPanel
      title="People directory"
      description="Profile cards, relationship paths, and life event summaries for the family."
    />
  );
}
