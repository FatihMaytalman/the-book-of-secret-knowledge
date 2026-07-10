import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import type { PlatformHealth } from '@/lib/api';

interface PlatformHealthPanelProps {
  health: PlatformHealth;
}

function statusLabel(online: boolean, configured?: boolean): string {
  if (!online) return 'Offline';
  if (configured === false) return 'Unconfigured';
  return 'Online';
}

function statusTone(online: boolean, configured?: boolean): string {
  if (!online) return 'text-red-300';
  if (configured === false) return 'text-amber-300';
  return 'text-turquoise-400';
}

export function PlatformHealthPanel({ health }: PlatformHealthPanelProps) {
  const apiOnline =
    health.api?.status === 'ok' || health.api?.status === 'degraded';
  const aiOnline = health.ai?.status === 'ok';
  const aiConfigured = health.ai?.status !== 'unconfigured';
  const databaseStatus = health.api?.database ?? 'unknown';

  return (
    <Card className="border-turquoise-500/20 bg-navy-950/60">
      <CardTitle>Platform health</CardTitle>
      <CardDescription>
        Live checks against the Kinvault API and Claude heritage assistant.
      </CardDescription>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.18em] text-warm-white/50">API</dt>
          <dd className={`mt-1 text-lg font-medium ${statusTone(apiOnline)}`}>
            {statusLabel(apiOnline)}
          </dd>
          <p className="mt-1 text-xs text-warm-white/60">
            {health.api?.service ?? 'aomlegacy-api unreachable'}
            {health.api ? ` · database ${databaseStatus}` : ''}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.18em] text-warm-white/50">Claude AI</dt>
          <dd className={`mt-1 text-lg font-medium ${statusTone(aiOnline, aiConfigured)}`}>
            {health.ai ? statusLabel(aiOnline, aiConfigured) : 'Offline'}
          </dd>
          <p className="mt-1 text-xs text-warm-white/60">
            {health.ai?.message ?? 'Anthropic assistant not reachable'}
          </p>
        </div>
      </dl>

      <p className="mt-4 text-xs text-warm-white/45">
        Checked {new Date(health.checkedAt).toLocaleString()}
      </p>
    </Card>
  );
}
