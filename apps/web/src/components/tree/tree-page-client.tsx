'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { FamilyTreeCanvas } from '@/components/tree/family-tree-canvas';
import { apiBaseUrl, fetchPeople, fetchRelationships, TOKEN_KEY } from '@/lib/api';

interface TreePageClientProps {
  familyId: string;
}

export function TreePageClient({ familyId }: TreePageClientProps) {
  const peopleQuery = useQuery({
    queryKey: ['people', familyId],
    queryFn: () => fetchPeople(familyId),
  });

  const relationshipsQuery = useQuery({
    queryKey: ['relationships', familyId],
    queryFn: () => fetchRelationships(familyId),
  });

  async function downloadGedcom() {
    const token = window.localStorage.getItem(TOKEN_KEY);
    const response = await fetch(
      `${apiBaseUrl}/relationships/gedcom?familyId=${encodeURIComponent(familyId)}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    );
    if (!response.ok) throw new Error('GEDCOM export failed');
    const text = await response.text();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'family.ged';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-gold-500">Family tree</p>
          <h2 className="mt-2 font-display text-4xl text-cream-50">Interactive family tree</h2>
          <p className="mt-3 max-w-2xl text-warm-white/70">
            Graph navigation with pan, zoom, and branch collapse — ported from FamilyChain.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void downloadGedcom()}>
          Export GEDCOM
        </Button>
      </div>

      {peopleQuery.isLoading || relationshipsQuery.isLoading ? (
        <p className="text-warm-white/60">Loading tree…</p>
      ) : (
        <FamilyTreeCanvas
          familyId={familyId}
          people={peopleQuery.data ?? []}
          relationships={relationshipsQuery.data ?? []}
        />
      )}
    </div>
  );
}
