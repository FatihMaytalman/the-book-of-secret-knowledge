import type { Metadata } from 'next';
import { UploadForm } from '@/components/memories/upload-form';

export const metadata: Metadata = {
  title: 'Upload',
};

interface UploadPageProps {
  params: Promise<{ id: string }>;
}

export default async function UploadPage({ params }: UploadPageProps) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-gold-500">Upload</p>
        <h2 className="mt-2 font-display text-4xl text-cream-50">Add a memory</h2>
      </div>
      <UploadForm familyId={id} />
    </div>
  );
}
