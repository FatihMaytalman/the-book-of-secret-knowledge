import { Injectable, NotFoundException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { FamilyEntity, ImmichSyncStateEntity, MediaInstanceEntity } from '../../database/entities';
import type { AuditService } from '../audit/audit.service';
import type { DedupService } from './dedup.service';
import { sha256Hex } from './hash.util';
import { type ImmichAsset, ImmichClient, ImmichClientError } from './immich.client';

export interface ImmichSyncSummary {
  familyId: string;
  scanned: number;
  imported: number;
  linkedDuplicates: number;
  skippedAlreadySynced: number;
  failed: number;
  lastImmichUpdatedAt: string | null;
  errors: string[];
}

@Injectable()
export class MediaSyncService {
  private readonly immichClient: ImmichClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly dedupService: DedupService,
    private readonly auditService: AuditService,
    @InjectRepository(FamilyEntity)
    private readonly familyRepository: Repository<FamilyEntity>,
    @InjectRepository(ImmichSyncStateEntity)
    private readonly syncStateRepository: Repository<ImmichSyncStateEntity>,
    @InjectRepository(MediaInstanceEntity)
    private readonly mediaInstanceRepository: Repository<MediaInstanceEntity>,
  ) {
    this.immichClient = new ImmichClient(
      this.configService.get<string>('IMMICH_URL', '').replace(/\/$/, ''),
      this.configService.get<string>('IMMICH_API_KEY', ''),
    );
  }

  isImmichConfigured(): boolean {
    return this.immichClient.isConfigured();
  }

  async getSyncState(familyId: string): Promise<ImmichSyncStateEntity | null> {
    return this.syncStateRepository.findOne({ where: { familyId } });
  }

  async syncImmichAssets(familyId: string): Promise<ImmichSyncSummary> {
    const family = await this.familyRepository.findOne({ where: { id: familyId } });
    if (!family) {
      throw new NotFoundException(`Family ${familyId} was not found`);
    }

    if (!this.immichClient.isConfigured()) {
      throw new ImmichClientError(
        'Immich sync is not configured. Set IMMICH_URL and IMMICH_API_KEY.',
      );
    }

    const syncState =
      (await this.syncStateRepository.findOne({ where: { familyId } })) ??
      (await this.syncStateRepository.save(this.syncStateRepository.create({ familyId })));

    const searchResult = await this.immichClient.searchAssets(
      syncState.lastImmichUpdatedAt ?? undefined,
    );

    const summary: ImmichSyncSummary = {
      familyId,
      scanned: searchResult.assets.length,
      imported: 0,
      linkedDuplicates: 0,
      skippedAlreadySynced: 0,
      failed: 0,
      lastImmichUpdatedAt: syncState.lastImmichUpdatedAt?.toISOString() ?? null,
      errors: [],
    };

    let latestUpdatedAt = syncState.lastImmichUpdatedAt;

    for (const asset of searchResult.assets) {
      try {
        const result = await this.processImmichAsset(familyId, asset);
        if (result === 'skipped') {
          summary.skippedAlreadySynced += 1;
        } else if (result === 'imported') {
          summary.imported += 1;
        } else {
          summary.linkedDuplicates += 1;
        }

        const assetUpdatedAt = asset.updatedAt ? new Date(asset.updatedAt) : null;
        if (assetUpdatedAt && (!latestUpdatedAt || assetUpdatedAt > latestUpdatedAt)) {
          latestUpdatedAt = assetUpdatedAt;
        }
      } catch (error) {
        summary.failed += 1;
        summary.errors.push(
          `${asset.id}: ${error instanceof Error ? error.message : 'Unknown sync error'}`,
        );
      }
    }

    syncState.lastSyncedAt = new Date();
    syncState.lastImmichUpdatedAt = latestUpdatedAt ?? syncState.lastImmichUpdatedAt;
    syncState.lastSyncSummary = summary as unknown as Record<string, unknown>;
    await this.syncStateRepository.save(syncState);

    summary.lastImmichUpdatedAt = syncState.lastImmichUpdatedAt?.toISOString() ?? null;

    await this.auditService.record({
      familyId,
      action: 'media.immich_sync.completed',
      resourceType: 'immich_sync_state',
      resourceId: syncState.id,
      metadata: summary as unknown as Record<string, unknown>,
    });

    return summary;
  }

  private async processImmichAsset(
    familyId: string,
    asset: ImmichAsset,
  ): Promise<'skipped' | 'imported' | 'linked'> {
    const existing = await this.mediaInstanceRepository.findOne({
      where: { immichAssetId: asset.id },
    });

    if (existing) {
      return 'skipped';
    }

    const original = await this.immichClient.downloadOriginal(asset.id);
    const sha256 = sha256Hex(original);
    const byteSize = asset.exifInfo?.fileSizeInByte ?? original.byteLength;

    const result = await this.dedupService.canonicalizeImmichAsset({
      familyId,
      immichAsset: asset,
      sha256,
      byteSize,
    });

    if (result.linkedToExisting) {
      return 'linked';
    }

    if (result.mediaInstance.immichAssetId === asset.id) {
      return 'imported';
    }

    return 'skipped';
  }
}
