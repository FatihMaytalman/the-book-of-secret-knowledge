import type { Metadata } from 'next';
import { PlaceholderPanel } from '@/components/layout/placeholder-panel';

export const metadata: Metadata = {
  title: 'Family Tree',
};

export default function TreePage() {
  return (
    <PlaceholderPanel
      title="Interactive family tree"
      description="Graph navigation with simple and expert modes for relationship exploration."
    />
  );
}
