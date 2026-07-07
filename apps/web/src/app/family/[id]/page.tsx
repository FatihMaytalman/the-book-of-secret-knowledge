import type { Metadata } from 'next';
import { fetchApiHealth, fetchFamily, fetchPeople } from '@/lib/api';
import { FamilyDashboard } from '@/components/dashboard/family-dashboard';

interface FamilyDashboardPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: FamilyDashboardPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const family = await fetchFamily(id);
    return { title: `${family.name} · Dashboard` };
  } catch {
    return { title: 'Dashboard' };
  }
}

export default async function FamilyDashboardPage({ params }: FamilyDashboardPageProps) {
  const { id } = await params;

  const [family, people, apiStatus] = await Promise.all([
    fetchFamily(id),
    fetchPeople(id).catch(() => []),
    fetchApiHealth()
      .then((health) => health.status)
      .catch(() => 'offline'),
  ]);

  return (
    <FamilyDashboard
      familyName={family.name}
      apiStatus={apiStatus}
      peopleCount={people.length}
      mediaAssetCount={family.mediaAssetCount}
    />
  );
}
