import { Card, CardDescription, CardTitle } from '@/components/ui/card';

interface DashboardStatProps {
  label: string;
  value: string;
  hint: string;
}

function DashboardStat({ label, value, hint }: DashboardStatProps) {
  return (
    <Card>
      <CardTitle>{value}</CardTitle>
      <CardDescription>{label}</CardDescription>
      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-turquoise-500">{hint}</p>
    </Card>
  );
}

interface DashboardSectionProps {
  title: string;
  description: string;
  items: string[];
}

function DashboardSection({ title, description, items }: DashboardSectionProps) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
      <ul className="mt-5 space-y-3 text-sm text-warm-white/80">
        {items.map((item) => (
          <li key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

interface FamilyDashboardProps {
  familyName: string;
  apiStatus?: string;
  peopleCount?: number;
  mediaAssetCount?: number;
}

export function FamilyDashboard({
  familyName,
  apiStatus = 'unknown',
  peopleCount = 0,
  mediaAssetCount = 0,
}: FamilyDashboardProps) {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm uppercase tracking-[0.24em] text-gold-500">Today in your family&apos;s story</p>
        <h2 className="mt-2 max-w-3xl font-display text-4xl text-balance text-cream-50">
          Welcome back to {familyName}
        </h2>
        <p className="mt-3 max-w-2xl text-warm-white/70">
          This dashboard shell is ready for recent uploads, people needing identification, and
          backup health once the API endpoints are connected.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <DashboardStat label="People" value={String(peopleCount)} hint="Profiles in this family" />
        <DashboardStat
          label="Media assets"
          value={String(mediaAssetCount)}
          hint="Canonical memories"
        />
        <DashboardStat label="API status" value={apiStatus} hint="Backend health" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <DashboardSection
          title="Recent uploads"
          description="New memories waiting for family context."
          items={[
            'Wedding album scan batch uploaded yesterday',
            'Three WhatsApp duplicates grouped for review',
            'Voice note from Aunt Leyla tagged to a life event',
          ]}
        />
        <DashboardSection
          title="Backup health"
          description="Preservation checks for the home server."
          items={[
            'Primary media drive mounted and writable',
            'Backup mirror last verified 6 hours ago',
            'PostgreSQL backup completed successfully',
          ]}
        />
      </section>
    </div>
  );
}
