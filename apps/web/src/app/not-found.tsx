import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-[0.24em] text-gold-500">Not found</p>
      <h1 className="mt-4 font-display text-4xl text-cream-50">
        This page is not in the archive yet
      </h1>
      <p className="mt-3 max-w-md text-warm-white/70">
        The route you requested does not exist or the family workspace is unavailable.
      </p>
      <Link href="/" className="mt-8">
        <Button variant="secondary">Return home</Button>
      </Link>
    </div>
  );
}
