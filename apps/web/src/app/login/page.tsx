import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Authentication will connect to the AOM Legacy API in a later step.
        </CardDescription>
        <form className="mt-8 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="text-warm-white/80">Email</span>
            <input
              type="email"
              placeholder="you@family.com"
              className="w-full rounded-xl border border-white/10 bg-navy-950 px-4 py-3 text-warm-white outline-none ring-turquoise-500/40 focus:ring-2"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="text-warm-white/80">Password</span>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-navy-950 px-4 py-3 text-warm-white outline-none ring-turquoise-500/40 focus:ring-2"
            />
          </label>
          <Button className="w-full" disabled>
            Continue
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-warm-white/60">
          Need a family workspace?{' '}
          <Link href="/families" className="text-turquoise-500 hover:underline">
            Choose a family
          </Link>
        </p>
      </Card>
    </div>
  );
}
