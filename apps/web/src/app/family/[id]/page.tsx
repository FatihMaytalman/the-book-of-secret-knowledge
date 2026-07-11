import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { fetchApiHealth, fetchFamily, fetchPeople, TOKEN_KEY } from '@/lib/api';
import { FamilyDashboard } from '@/components/dashboard/family-dashboard';

async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(TOKEN_KEY)?.value;
}

interface FamilyDashboardPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: FamilyDashboardPageProps): Promise<Metadata> {
  const { id } = await params;
  const token = await getToken();
  if (!token) {
    return { title: 'Dashboard' };
  }
  try {
    const family = await fetchFamily(id, token);
    return { title: `${family.name} · Dashboard` };
  } catch {
    return { title: 'Dashboard' };
  }
}

export default async function FamilyDashboardPage({ params }: FamilyDashboardPageProps) {
  const { id } = await params;
  const token = await getToken();

  if (!token) {
    redirect('/login');
  }

  let family;
  try {
    family = await fetchFamily(id, token);
  } catch {
    notFound();
  }

  const [people, apiStatus] = await Promise.all([
    fetchPeople(id, token).catch(() => []),
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
