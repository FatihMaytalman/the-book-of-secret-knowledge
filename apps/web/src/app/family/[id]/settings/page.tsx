import type { Metadata } from 'next';
import { FamilySettingsClient } from '@/components/family/family-settings-client';

export const metadata: Metadata = {
  title: 'Settings',
};

interface SettingsPageProps {
  params: Promise<{ id: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-gold-500">Settings</p>
        <h2 className="mt-2 font-display text-4xl text-cream-50">Family & invites</h2>
      </div>
      <FamilySettingsClient familyId={id} />
    </div>
  );
}
