'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { acceptInvite, TOKEN_KEY } from '@/lib/api';

export function InviteAcceptClient({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const hasSession = typeof window !== 'undefined' && !!window.localStorage.getItem(TOKEN_KEY);

  useEffect(() => {
    if (!hasSession) return;
    setPending(true);
    acceptInvite(token)
      .then(({ familyId }) => router.push(`/family/${familyId}/timeline`))
      .catch((err: Error) => setError(err.message))
      .finally(() => setPending(false));
  }, [hasSession, token, router]);

  if (!hasSession) {
    return (
      <Card>
        <CardTitle>Join your family</CardTitle>
        <CardDescription>
          Sign in with the email address that received this invite, then return to this link.
        </CardDescription>
        <Button className="mt-4" onClick={() => router.push('/login')}>
          Sign in
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>{pending ? 'Accepting invite…' : 'Invite'}</CardTitle>
      {error ? <CardDescription className="text-red-400">{error}</CardDescription> : null}
    </Card>
  );
}
