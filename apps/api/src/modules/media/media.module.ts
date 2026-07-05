import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaAssetEntity, MediaInstanceEntity } from '../../database/entities';
import { AuditModule } from '../audit/audit.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaAssetEntity, MediaInstanceEntity]),
    AuditModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [TypeOrmModule, AuditModule, MediaService],
})
export class MediaModule {}
