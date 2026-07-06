import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { FamilyEntity } from './family.entity';
import { UserAccountEntity } from './user-account.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other',
}

@Entity({ name: 'media_asset' })
@Unique('UQ_media_asset_family_sha256', ['familyId', 'canonicalSha256'])
export class MediaAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'family_id', type: 'uuid' })
  familyId!: string;

  @ManyToOne(() => FamilyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'family_id' })
  family!: FamilyEntity;

  @Column({ name: 'canonical_sha256', type: 'text' })
  canonicalSha256!: string;

  @Column({ name: 'media_type', type: 'text' })
  mediaType!: MediaType;

  @Column({ name: 'byte_size', type: 'bigint', default: '0' })
  byteSize!: string;

  @Column({ name: 'storage_uri', type: 'text' })
  storageUri!: string;

  @Column({ name: 'immich_asset_id', type: 'text', nullable: true })
  @Index('IDX_media_asset_immich_asset_id')
  immichAssetId!: string | null;

  @Column({ name: 'captured_at', type: 'timestamptz', nullable: true })
  capturedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'media_instance' })
export class MediaInstanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'media_asset_id', type: 'uuid' })
  mediaAssetId!: string;

  @ManyToOne(() => MediaAssetEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'media_asset_id' })
  mediaAsset!: MediaAssetEntity;

  @Column({ name: 'uploaded_by_user_id', type: 'uuid', nullable: true })
  uploadedByUserId!: string | null;

  @ManyToOne(() => UserAccountEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'uploaded_by_user_id' })
  uploadedByUser!: UserAccountEntity | null;

  @Column({ name: 'source_app', type: 'text' })
  sourceApp!: string;

  @Column({ name: 'source_external_id', type: 'text', nullable: true })
  sourceExternalId!: string | null;

  @Column({ name: 'imported_from', type: 'text', nullable: true })
  importedFrom!: string | null;

  @Column({ name: 'original_filename', type: 'text' })
  originalFilename!: string;

  @Column({ name: 'immich_asset_id', type: 'text', nullable: true, unique: true })
  immichAssetId!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  exif!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

export enum DeduplicationDecision {
  AUTO_LINKED = 'auto_linked',
  NEEDS_REVIEW = 'needs_review',
  DISTINCT = 'distinct',
  REJECTED = 'rejected',
}

@Entity({ name: 'deduplication_candidate' })
export class DeduplicationCandidateEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'family_id', type: 'uuid' })
  familyId!: string;

  @ManyToOne(() => FamilyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'family_id' })
  family!: FamilyEntity;

  @Column({ name: 'candidate_media_asset_id', type: 'uuid' })
  candidateMediaAssetId!: string;

  @Column({ name: 'existing_media_asset_id', type: 'uuid' })
  existingMediaAssetId!: string;

  @Column({ type: 'numeric', precision: 4, scale: 3 })
  score!: string;

  @Column({ type: 'text', default: DeduplicationDecision.NEEDS_REVIEW })
  decision!: DeduplicationDecision;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  signals!: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'immich_sync_state' })
@Unique(['familyId'])
export class ImmichSyncStateEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'family_id', type: 'uuid' })
  familyId!: string;

  @ManyToOne(() => FamilyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'family_id' })
  family!: FamilyEntity;

  @Column({ name: 'last_synced_at', type: 'timestamptz', nullable: true })
  lastSyncedAt!: Date | null;

  @Column({ name: 'last_immich_updated_at', type: 'timestamptz', nullable: true })
  lastImmichUpdatedAt!: Date | null;

  @Column({ name: 'last_sync_summary', type: 'jsonb', nullable: true })
  lastSyncSummary!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
