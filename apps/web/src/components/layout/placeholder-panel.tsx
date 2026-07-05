import { Card, CardDescription, CardTitle } from '@/components/ui/card';

interface PlaceholderPanelProps {
  title: string;
  description: string;
}

export function PlaceholderPanel({ title, description }: PlaceholderPanelProps) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
      <p className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-8 text-sm text-warm-white/60">
        Phase 1 shell only. Data wiring comes in the next implementation steps.
      </p>
    </Card>
  );
}
