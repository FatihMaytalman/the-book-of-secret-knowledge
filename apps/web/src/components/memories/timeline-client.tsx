'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import {
  fetchMemories,
  toggleMemoryReaction,
} from '@/lib/api';
import { MemoryPhoto } from '@/components/memories/memory-photo';

interface TimelineClientProps {
  familyId: string;
}

export function TimelineClient({ familyId }: TimelineClientProps) {
  const queryClient = useQueryClient();
  const memoriesQuery = useQuery({
    queryKey: ['memories', familyId],
    queryFn: () => fetchMemories(familyId),
  });

  const reactionMutation = useMutation({
    mutationFn: (memoryId: string) => toggleMemoryReaction(memoryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['memories', familyId] });
    },
  });

  if (memoriesQuery.isLoading) {
    return <p className="text-warm-white/60">Loading memories…</p>;
  }

  const memories = memoriesQuery.data ?? [];

  if (memories.length === 0) {
    return (
      <Card>
        <CardTitle>No memories yet</CardTitle>
        <CardDescription>
          Upload your first family photo — one photo, one memory, one family.
        </CardDescription>
        <Link href={`/family/${familyId}/upload`} className="mt-4 inline-block">
          <Button>Add a memory</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {memories.map((memory) => (
        <Card key={memory.id} className="overflow-hidden">
          <MemoryPhoto memoryId={memory.id} />
          <div className="p-4 space-y-3">
            <p className="text-cream-50">{memory.caption}</p>
            <p className="text-xs text-warm-white/50">
              {memory.authorName}
              {memory.memoryDate ? ` · ${memory.memoryDate}` : ''}
            </p>
            <div className="flex items-center gap-3 text-sm">
              <button
                type="button"
                className={memory.userReacted ? 'text-gold-500' : 'text-warm-white/60'}
                onClick={() => reactionMutation.mutate(memory.id)}
              >
                ♥ {memory.reactionCount}
              </button>
              <Link
                href={`/family/${familyId}/memory/${memory.id}`}
                className="text-turquoise-500 hover:underline"
              >
                {memory.commentCount} comments
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
