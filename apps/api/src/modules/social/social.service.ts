import type { SocialProvenanceSummary, SocialProvider } from '@aomlegacy/shared';
import { Injectable } from '@nestjs/common';

export interface SocialConnectionSummary {
  provider: SocialProvider;
  connected: boolean;
  syncMode: 'manual' | 'daily' | 'weekly' | 'paused';
  lastSyncedAt?: string;
}

@Injectable()
export class SocialService {
  listConnections(): SocialConnectionSummary[] {
    return [
      {
        provider: 'google_photos',
        connected: false,
        syncMode: 'paused',
      },
      {
        provider: 'facebook',
        connected: false,
        syncMode: 'paused',
      },
      {
        provider: 'whatsapp',
        connected: false,
        syncMode: 'manual',
      },
    ];
  }

  listImportedProvenance(): SocialProvenanceSummary[] {
    return [
      {
        provider: 'whatsapp',
        externalId: 'chat-export:family-group:photo-001',
        importedAt: '2026-07-05T00:00:00.000Z',
      },
      {
        provider: 'google_photos',
        externalId: 'google-photo:example-asset',
        importedAt: '2026-07-05T00:00:00.000Z',
      },
    ];
  }
}
