import type { Metadata } from 'next';
import { fetchApiHealth } from '@/lib/api';
import { FamilyDashboard } from '@/components/dashboard/family-dashboard';

interface FamilyDashboardPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: FamilyDashboardPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Dashboard · ${id}`,
  };
}

export default async function FamilyDashboardPage({ params }: FamilyDashboardPageProps) {
  const { id } = await params;

  let apiStatus = 'offline';
  try {
    const health = await fetchApiHealth();
    apiStatus = health.status;
  } catch {
    apiStatus = 'offline';
  }

  const familyName =
    id === 'maytalman' ? 'Maytalman Family Archive' : 'Demo Family Workspace';

  return <FamilyDashboard familyName={familyName} apiStatus={apiStatus} />;
}
