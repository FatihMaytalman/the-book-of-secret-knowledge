import type { Metadata } from 'next';
import { InviteAcceptClient } from '@/components/family/invite-accept-client';

export const metadata: Metadata = {
  title: 'Accept invite',
};

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="text-sm uppercase tracking-[0.28em] text-gold-500">
        Bizimkiler — One Photo. One Memory. One Family.
      </p>
      <InviteAcceptClient token={token} />
    </div>
  );
}
