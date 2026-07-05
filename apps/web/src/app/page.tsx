import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(46,196,182,0.12),_transparent_40%),linear-gradient(180deg,#0d1b2a_0%,#1a1a2e_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <p className="text-sm uppercase tracking-[0.28em] text-gold-500">AOM Legacy</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl text-balance text-cream-50 md:text-6xl">
          A private museum for your family&apos;s story
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-warm-white/75">
          Family Tree combines self-hosted media preservation, genealogy, collaborative
          storytelling, and careful AI assistance in one calm, respectful archive.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/login">
            <Button>Sign in to your family</Button>
          </Link>
          <Link href="/families">
            <Button variant="secondary">Choose a family</Button>
          </Link>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <Card>
            <CardTitle>Preserve</CardTitle>
            <CardDescription>
              Keep photos, videos, documents, and stories safe with exportable metadata.
            </CardDescription>
          </Card>
          <Card>
            <CardTitle>Connect</CardTitle>
            <CardDescription>
              Build a living family graph with people, events, and shared memories.
            </CardDescription>
          </Card>
          <Card>
            <CardTitle>Protect</CardTitle>
            <CardDescription>
              Stay private by default with audit trails, permissions, and backup health.
            </CardDescription>
          </Card>
        </div>
      </div>
    </div>
  );
}
