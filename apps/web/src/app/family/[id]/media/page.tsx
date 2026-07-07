import type { Metadata } from 'next';
import { PlaceholderPanel } from '@/components/layout/placeholder-panel';

export const metadata: Metadata = {
  title: 'Media',
};

export default function MediaPage() {
  return (
    <PlaceholderPanel
      title="Media library"
      description="Virtualized media grid with responsive thumbnails and Immich-backed assets."
    />
  );
}
