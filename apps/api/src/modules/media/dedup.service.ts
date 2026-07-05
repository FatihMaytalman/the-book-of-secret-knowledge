import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { DeduplicationCandidate, MediaAssetSummary } from '@aomlegacy/shared';
import {
  DeduplicationCandidateEntity,
  DeduplicationDecision,
  MediaAssetEntity,
  MediaInstanceEntity,
  MediaType,
} from '../../database/entities';
import type { ImmichAsset } from './immich.client';

export interface CanonicalizeImmichAssetInput {
  familyId: string;
  immichAsset: ImmichAsset;
  sha256: string;
  byteSize: number;
}

export interface CanonicalizeImmichAssetResult {
  mediaAsset: MediaAssetEntity;
  mediaInstance: MediaInstanceEntity;
  deduplicationCandidate: DeduplicationCandidateEntity | null;
  linkedToExisting: boolean;
}

@Injectable()
export class DedupService {
  constructor(
    @InjectRepository(MediaAssetEntity)
    private readonly mediaAssetRepository: Repository<MediaAssetEntity>,
    @InjectRepository(MediaInstanceEntity)
    private readonly mediaInstanceRepository: Repository<MediaInstanceEntity>,
    @InjectRepository(DeduplicationCandidateEntity)
    private readonly dedupRepository: Repository<DeduplicationCandidateEntity>,
  ) {}

  async canonicalizeImmichAsset(
    input: CanonicalizeImmichAssetInput,
  ): Promise<CanonicalizeImmichAssetResult> {
    const existingInstance = await this.mediaInstanceRepository.findOne({
      where: { immichAssetId: input.immichAsset.id },
    });

    if (existingInstance) {
      const mediaAsset = await this.mediaAssetRepository.findOneOrFail({
        where: { id: existingInstance.mediaAssetId },
      });

      return {
        mediaAsset,
        mediaInstance: existingInstance,
        deduplicationCandidate: null,
        linkedToExisting: false,
      };
    }

    const existingAsset = await this.mediaAssetRepository.findOne({
      where: {
        familyId: input.familyId,
        canonicalSha256: input.sha256,
      },
    });

    if (existingAsset) {
      const mediaInstance = await this.mediaInstanceRepository.save(
        this.mediaInstanceRepository.create({
          mediaAssetId: existingAsset.id,
          uploadedByUserId: null,
          sourceApp: 'immich',
          sourceExternalId: input.immichAsset.id,
          importedFrom: 'immich',
          originalFilename: input.immichAsset.originalFileName,
          immichAssetId: input.immichAsset.id,
          exif: {
            immichChecksum: input.immichAsset.checksum ?? null,
            immichType: input.immichAsset.type,
          },
        }),
      );

      return {
        mediaAsset: existingAsset,
        mediaInstance,
        deduplicationCandidate: null,
        linkedToExisting: true,
      };
    }

    const mediaAsset = await this.mediaAssetRepository.save(
      this.mediaAssetRepository.create({
        familyId: input.familyId,
        canonicalSha256: input.sha256,
        mediaType: mapImmichMediaType(input.immichAsset.type),
        byteSize: String(input.byteSize),
        storageUri: `immich://asset/${input.immichAsset.id}`,
        immichAssetId: input.immichAsset.id,
        capturedAt: input.immichAsset.fileCreatedAt
          ? new Date(input.immichAsset.fileCreatedAt)
          : null,
      }),
    );

    const mediaInstance = await this.mediaInstanceRepository.save(
      this.mediaInstanceRepository.create({
        mediaAssetId: mediaAsset.id,
        uploadedByUserId: null,
        sourceApp: 'immich',
        sourceExternalId: input.immichAsset.id,
        importedFrom: 'immich',
        originalFilename: input.immichAsset.originalFileName,
        immichAssetId: input.immichAsset.id,
        exif: {
          immichChecksum: input.immichAsset.checksum ?? null,
          immichType: input.immichAsset.type,
        },
      }),
    );

    return {
      mediaAsset,
      mediaInstance,
      deduplicationCandidate: null,
      linkedToExisting: false,
    };
  }

  toCandidateSummary(entity: DeduplicationCandidateEntity): DeduplicationCandidate {
    return {
      candidateMediaAssetId: entity.candidateMediaAssetId,
      existingMediaAssetId: entity.existingMediaAssetId,
      score: Number(entity.score),
      decision: entity.decision,
      signals: entity.signals,
    };
  }

  toAssetSummary(entity: MediaAssetEntity, provenanceCount: number): MediaAssetSummary {
    return {
      id: entity.id,
      familyId: entity.familyId,
      mediaType: entity.mediaType,
      capturedAt: entity.capturedAt?.toISOString(),
      canonicalSha256: entity.canonicalSha256 ?? undefined,
      storageUri: entity.storageUri,
      byteSize: Number(entity.byteSize),
      provenanceCount,
    };
  }
}

function mapImmichMediaType(type: ImmichAsset['type']): MediaType {
  switch (type) {
    case 'IMAGE':
      return MediaType.IMAGE;
    case 'VIDEO':
      return MediaType.VIDEO;
    case 'AUDIO':
      return MediaType.AUDIO;
    default:
      return MediaType.OTHER;
  }
}
