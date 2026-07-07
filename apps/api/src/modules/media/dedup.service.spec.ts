import 'reflect-metadata';

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import type { Repository } from 'typeorm';

import {
  type MediaAssetEntity,
  type MediaInstanceEntity,
  MediaType,
} from '../../database/entities';
import { DedupService } from './dedup.service';
import type { ImmichAsset } from './immich.client';

type Identified = { id?: string };
type Query<T> = Partial<Record<keyof T, unknown>>;

class InMemoryRepository<T extends Identified> {
  private sequence = 0;

  constructor(private readonly rows: T[] = []) {}

  create(input: Partial<T>): T {
    return { ...input } as T;
  }

  async save(input: T): Promise<T> {
    if (!input.id) {
      this.sequence += 1;
      input.id = `row-${this.sequence}`;
    }

    const existingIndex = this.rows.findIndex((row) => row.id === input.id);
    if (existingIndex >= 0) {
      this.rows[existingIndex] = input;
    } else {
      this.rows.push(input);
    }

    return input;
  }

  async findOne(options: { where: Query<T> | Query<T>[] }): Promise<T | null> {
    const queries = Array.isArray(options.where) ? options.where : [options.where];
    return this.rows.find((row) => queries.some((query) => matches(row, query))) ?? null;
  }

  async findOneOrFail(options: { where: Query<T> }): Promise<T> {
    const row = await this.findOne(options);
    if (!row) {
      throw new Error(`Row not found for ${JSON.stringify(options.where)}`);
    }

    return row;
  }

  all(): T[] {
    return this.rows;
  }
}

describe('DedupService', () => {
  it('creates a canonical media asset and media instance for a new Immich asset', async () => {
    const assetRepository = new InMemoryRepository<MediaAssetEntity>();
    const instanceRepository = new InMemoryRepository<MediaInstanceEntity>();
    const service = createService(assetRepository, instanceRepository);

    const result = await service.canonicalizeImmichAsset({
      familyId: 'family-1',
      immichAsset: makeImmichAsset({ id: 'immich-new', type: 'IMAGE' }),
      sha256: 'a'.repeat(64),
      byteSize: 123,
    });

    assert.equal(result.linkedToExisting, false);
    assert.equal(result.mediaAsset.mediaType, MediaType.IMAGE);
    assert.equal(result.mediaAsset.canonicalSha256, 'a'.repeat(64));
    assert.equal(result.mediaAsset.storageUri, 'immich://asset/immich-new');
    assert.equal(result.mediaInstance.mediaAssetId, result.mediaAsset.id);
    assert.equal(result.mediaInstance.immichAssetId, 'immich-new');
    assert.equal(assetRepository.all().length, 1);
    assert.equal(instanceRepository.all().length, 1);
  });

  it('links an exact duplicate Immich asset to the existing family media asset', async () => {
    const existingAsset = mediaAsset({
      id: 'asset-existing',
      familyId: 'family-1',
      canonicalSha256: 'b'.repeat(64),
      mediaType: MediaType.IMAGE,
    });
    const assetRepository = new InMemoryRepository<MediaAssetEntity>([existingAsset]);
    const instanceRepository = new InMemoryRepository<MediaInstanceEntity>();
    const service = createService(assetRepository, instanceRepository);

    const result = await service.canonicalizeImmichAsset({
      familyId: 'family-1',
      immichAsset: makeImmichAsset({ id: 'immich-copy', type: 'IMAGE' }),
      sha256: 'b'.repeat(64),
      byteSize: 456,
    });

    assert.equal(result.linkedToExisting, true);
    assert.equal(result.mediaAsset.id, 'asset-existing');
    assert.equal(result.mediaInstance.mediaAssetId, 'asset-existing');
    assert.equal(result.mediaInstance.sourceExternalId, 'immich-copy');
    assert.equal(assetRepository.all().length, 1);
    assert.equal(instanceRepository.all().length, 1);
  });

  it('returns the existing media instance when the Immich asset was already synced', async () => {
    const existingAsset = mediaAsset({
      id: 'asset-synced',
      familyId: 'family-1',
      canonicalSha256: 'c'.repeat(64),
      mediaType: MediaType.VIDEO,
    });
    const existingInstance = mediaInstance({
      id: 'instance-synced',
      mediaAssetId: 'asset-synced',
      immichAssetId: 'immich-synced',
    });
    const assetRepository = new InMemoryRepository<MediaAssetEntity>([existingAsset]);
    const instanceRepository = new InMemoryRepository<MediaInstanceEntity>([existingInstance]);
    const service = createService(assetRepository, instanceRepository);

    const result = await service.canonicalizeImmichAsset({
      familyId: 'family-1',
      immichAsset: makeImmichAsset({ id: 'immich-synced', type: 'VIDEO' }),
      sha256: 'c'.repeat(64),
      byteSize: 789,
    });

    assert.equal(result.linkedToExisting, false);
    assert.equal(result.mediaAsset.id, 'asset-synced');
    assert.equal(result.mediaInstance.id, 'instance-synced');
    assert.equal(assetRepository.all().length, 1);
    assert.equal(instanceRepository.all().length, 1);
  });
});

function createService(
  assetRepository: InMemoryRepository<MediaAssetEntity>,
  instanceRepository: InMemoryRepository<MediaInstanceEntity>,
): DedupService {
  return new DedupService(
    assetRepository as unknown as Repository<MediaAssetEntity>,
    instanceRepository as unknown as Repository<MediaInstanceEntity>,
  );
}

function makeImmichAsset(overrides: Partial<ImmichAsset>): ImmichAsset {
  return {
    id: 'immich-asset',
    originalFileName: 'IMG_0001.JPG',
    type: 'IMAGE',
    fileCreatedAt: '2026-07-05T00:00:00.000Z',
    updatedAt: '2026-07-05T00:00:00.000Z',
    checksum: 'immich-checksum',
    ...overrides,
  };
}

function mediaAsset(overrides: Partial<MediaAssetEntity>): MediaAssetEntity {
  return {
    id: 'asset',
    familyId: 'family',
    canonicalSha256: '0'.repeat(64),
    mediaType: MediaType.IMAGE,
    byteSize: '0',
    storageUri: 'immich://asset/example',
    immichAssetId: null,
    capturedAt: null,
    createdAt: new Date('2026-07-05T00:00:00.000Z'),
    ...overrides,
  } as MediaAssetEntity;
}

function mediaInstance(overrides: Partial<MediaInstanceEntity>): MediaInstanceEntity {
  return {
    id: 'instance',
    mediaAssetId: 'asset',
    uploadedByUserId: null,
    uploadedByUser: null,
    sourceApp: 'immich',
    sourceExternalId: null,
    importedFrom: 'immich',
    originalFilename: 'IMG_0001.JPG',
    immichAssetId: null,
    exif: null,
    createdAt: new Date('2026-07-05T00:00:00.000Z'),
    ...overrides,
  } as MediaInstanceEntity;
}

function matches<T extends Identified>(row: T, query: Query<T>): boolean {
  return Object.entries(query).every(([key, value]) => row[key as keyof T] === value);
}
