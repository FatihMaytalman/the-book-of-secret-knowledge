import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DeduplicationCandidateEntity,
  FamilyEntity,
  ImmichSyncStateEntity,
  MediaAssetEntity,
  MediaInstanceEntity,
} from '../../database/entities';
import { AuditModule } from '../audit/audit.module';
import { DedupService } from './dedup.service';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaSyncService } from './media-sync.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MediaAssetEntity,
      MediaInstanceEntity,
      DeduplicationCandidateEntity,
      ImmichSyncStateEntity,
      FamilyEntity,
    ]),
    AuditModule,
  ],
  controllers: [MediaController],
  providers: [MediaService, DedupService, MediaSyncService],
  exports: [TypeOrmModule, AuditModule, MediaService, DedupService, MediaSyncService],
})
export class MediaModule {}
