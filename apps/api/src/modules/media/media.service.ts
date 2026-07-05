import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { DeduplicationCandidate, MediaAssetSummary } from '@aomlegacy/shared';
import { Repository } from 'typeorm';
import {
  MediaAssetEntity,
  MediaInstanceEntity,
  MediaType,
} from '../../database/entities';
import { AuditService } from '../audit/audit.service';
import { ImportImmichAssetDto } from './dto/import-immich-asset.dto';

export interface ImmichImportResult {
  mediaAssetId: string;
  mediaInstanceId: string | null;
  decision: 'created' | 'exact_duplicate_linked' | 'already_synced';
  canonicalSha256: string;
}

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaAssetEntity)
    private readonly mediaAssetRepository: Repository<MediaAssetEntity>,
    @InjectRepository(MediaInstanceEntity)
    private readonly mediaInstanceRepository: Repository<MediaInstanceEntity>,
    private readonly auditService: AuditService,
  ) {}

  async listMediaAssets(familyId?: string): Promise<MediaAssetSummary[]> {
    const assets = await this.mediaAssetRepository.find({
      where: familyId ? { familyId } : {},
      order: { createdAt: 'DESC' },
      take: 100,
    });

    return Promise.all(
      assets.map(async (asset) => ({
        id: asset.id,
        familyId: asset.familyId,
        mediaType: this.toSummaryMediaType(asset.mediaType),
        capturedAt: asset.capturedAt?.toISOString(),
        canonicalSha256: asset.canonicalSha256,
        storageUri: asset.storageUri,
        byteSize: Number(asset.byteSize),
        provenanceCount: await this.mediaInstanceRepository.count({
          where: { mediaAssetId: asset.id },
        }),
      })),
    );
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

  async importImmichAsset(input: ImportImmichAssetDto): Promise<ImmichImportResult> {
    const canonicalSha256 = this.normalizeSha256(input.sha256);

    const existingInstance = await this.mediaInstanceRepository.findOne({
      where: {
        sourceApp: 'immich',
        sourceExternalId: input.immichAssetId,
      },
    });

    if (existingInstance) {
      return {
        mediaAssetId: existingInstance.mediaAssetId,
        mediaInstanceId: existingInstance.id,
        decision: 'already_synced',
        canonicalSha256,
      };
    }

    let mediaAsset = await this.mediaAssetRepository.findOne({
      where: {
        familyId: input.familyId,
        canonicalSha256,
      },
    });

    const decision: ImmichImportResult['decision'] = mediaAsset
      ? 'exact_duplicate_linked'
      : 'created';

    if (!mediaAsset) {
      mediaAsset = this.mediaAssetRepository.create({
        familyId: input.familyId,
        canonicalSha256,
        mediaType: input.mediaType as MediaType,
        byteSize: String(input.byteSize),
        storageUri: input.storageUri,
        immichAssetId: input.immichAssetId,
        capturedAt: input.capturedAt ? new Date(input.capturedAt) : null,
      });
      mediaAsset = await this.mediaAssetRepository.save(mediaAsset);
    } else if (!mediaAsset.immichAssetId) {
      mediaAsset.immichAssetId = input.immichAssetId;
      await this.mediaAssetRepository.save(mediaAsset);
    }

    const mediaInstance = this.mediaInstanceRepository.create({
      mediaAssetId: mediaAsset.id,
      uploadedByUserId: input.uploadedByUserId ?? null,
      sourceApp: 'immich',
      sourceExternalId: input.immichAssetId,
      importedFrom: 'immich',
      originalFilename: input.originalFilename,
      exif: input.exif ?? null,
    });
    const savedInstance = await this.mediaInstanceRepository.save(mediaInstance);

    await this.auditService.record({
      familyId: input.familyId,
      actorUserId: input.uploadedByUserId ?? null,
      action: 'media.immich_imported',
      resourceType: 'media_asset',
      resourceId: mediaAsset.id,
      metadata: {
        decision,
        immichAssetId: input.immichAssetId,
        mediaInstanceId: savedInstance.id,
        canonicalSha256,
      },
    });

    return {
      mediaAssetId: mediaAsset.id,
      mediaInstanceId: savedInstance.id,
      decision,
      canonicalSha256,
    };
  }

  private normalizeSha256(value: string): string {
    const normalized = value.trim().toLowerCase();

    if (!/^[a-f0-9]{64}$/.test(normalized)) {
      throw new BadRequestException('sha256 must be a 64-character lowercase or uppercase hex string');
    }

    return normalized;
  }

  private toSummaryMediaType(mediaType: MediaType): MediaAssetSummary['mediaType'] {
    if (mediaType === MediaType.IMAGE) {
      return 'image';
    }

    if (mediaType === MediaType.VIDEO) {
      return 'video';
    }

    if (mediaType === MediaType.AUDIO) {
      return 'audio';
    }

    if (mediaType === MediaType.DOCUMENT) {
      return 'document';
    }

    return 'other';
  }
}
