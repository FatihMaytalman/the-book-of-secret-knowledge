import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  AuditEventEntity,
  DeduplicationCandidateEntity,
  FamilyEntity,
  FamilyMembershipEntity,
  ImmichSyncStateEntity,
  MediaAssetEntity,
  MediaInstanceEntity,
  PersonEntity,
  PersonNameEntity,
  UserAccountEntity,
} from './entities';
import { InitialSchema1730000000000 } from './migrations/1730000000000-InitialSchema';
import { MediaDedupProvenance1730000001000 } from './migrations/1730000001000-MediaDedupProvenance';
import { ImmichSyncAndDedup1730000002000 } from './migrations/1730000002000-ImmichSyncAndDedup';

export const entities = [
  UserAccountEntity,
  FamilyEntity,
  FamilyMembershipEntity,
  PersonEntity,
  PersonNameEntity,
  MediaAssetEntity,
  MediaInstanceEntity,
  DeduplicationCandidateEntity,
  ImmichSyncStateEntity,
  AuditEventEntity,
];

export const migrations = [
  InitialSchema1730000000000,
  MediaDedupProvenance1730000001000,
  ImmichSyncAndDedup1730000002000,
];

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.AOM_DB_HOST ?? 'localhost',
  port: Number(process.env.AOM_DB_PORT ?? 5432),
  username: process.env.AOM_DB_USERNAME ?? 'aomlegacy',
  password: process.env.AOM_DB_PASSWORD ?? 'aomlegacy',
  database: process.env.AOM_DB_NAME ?? 'aomlegacy',
  entities,
  migrations,
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
