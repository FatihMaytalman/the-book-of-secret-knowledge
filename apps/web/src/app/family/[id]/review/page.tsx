import type { Metadata } from 'next';
import { PlaceholderPanel } from '@/components/layout/placeholder-panel';

export const metadata: Metadata = {
  title: 'Review Queue',
};

export default function ReviewPage() {
  return (
    <PlaceholderPanel
      title="Archive review"
      description="Duplicate candidates, OCR review, face tag confirmation, and AI suggestions."
    />
  );
}
