import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaAssetEntity, MediaInstanceEntity } from '../../database/entities';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaAssetEntity, MediaInstanceEntity]),
    AuditModule,
  ],
  exports: [TypeOrmModule, AuditModule],
})
export class MediaModule {}
