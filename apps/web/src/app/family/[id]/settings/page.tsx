import type { Metadata } from 'next';
import { PlaceholderPanel } from '@/components/layout/placeholder-panel';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function SettingsPage() {
  return (
    <PlaceholderPanel
      title="Family settings"
      description="Roles, invitations, backups, exports, privacy controls, and social connections."
    />
  );
}
