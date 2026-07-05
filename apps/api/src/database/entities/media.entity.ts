import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FamilyEntity } from './family.entity';
import { UserAccountEntity } from './user-account.entity';

export enum MediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

@Entity({ name: 'media_asset' })
export class MediaAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'family_id', type: 'uuid' })
  familyId!: string;

  @ManyToOne(() => FamilyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'family_id' })
  family!: FamilyEntity;

  @Column({ name: 'canonical_sha256', type: 'text', unique: true })
  canonicalSha256!: string;

  @Column({ name: 'media_type', type: 'text' })
  mediaType!: MediaType;

  @Column({ name: 'byte_size', type: 'bigint' })
  byteSize!: string;

  @Column({ name: 'storage_uri', type: 'text' })
  storageUri!: string;

  @Column({ name: 'immich_asset_id', type: 'text', nullable: true })
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

  @Column({ name: 'original_filename', type: 'text' })
  originalFilename!: string;

  @Column({ type: 'jsonb', nullable: true })
  exif!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
