import { Injectable } from '@nestjs/common';
import type { DeduplicationCandidate, MediaAssetSummary } from '@aomlegacy/shared';

@Injectable()
export class MediaService {
  private readonly mediaAssets: MediaAssetSummary[] = [
    {
      id: 'media-family-photo',
      familyId: 'family-aom',
      mediaType: 'image',
      capturedAt: '2026-07-05T00:00:00.000Z',
      canonicalSha256: 'pending-real-hash',
      storageUri: 'immich://asset/family-photo',
      byteSize: 0,
      provenanceCount: 2,
    },
  ];

  listMediaAssets(): MediaAssetSummary[] {
    return this.mediaAssets;
  }

  listDeduplicationCandidates(): DeduplicationCandidate[] {
    return [
      {
        candidateMediaAssetId: 'media-whatsapp-copy',
        existingMediaAssetId: 'media-family-photo',
        score: 1,
        decision: 'auto_linked',
        signals: ['sha256', 'source_filename', 'uploaded_by_family_member'],
      },
      {
        candidateMediaAssetId: 'media-instagram-resize',
        existingMediaAssetId: 'media-family-photo',
        score: 0.91,
        decision: 'needs_review',
        signals: ['perceptual_hash', 'face_overlap', 'capture_window'],
      },
    ];
  }
}
