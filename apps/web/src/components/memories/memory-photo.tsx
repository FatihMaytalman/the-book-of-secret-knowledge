'use client';

import { useEffect, useState } from 'react';
import { memoryPhotoUrl, TOKEN_KEY } from '@/lib/api';

export function MemoryPhoto({ memoryId }: { memoryId: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    const token = window.localStorage.getItem(TOKEN_KEY);

    void fetch(memoryPhotoUrl(memoryId), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => {
        if (!response.ok) throw new Error('Photo load failed');
        return response.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(null));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [memoryId]);

  if (!src) {
    return <div className="aspect-[4/3] w-full rounded-xl bg-white/5" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
  );
}
