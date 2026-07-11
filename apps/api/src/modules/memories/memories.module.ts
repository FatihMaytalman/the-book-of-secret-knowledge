import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MemoryCommentEntity,
  MemoryEntity,
  MemoryReactionEntity,
  UserAccountEntity,
} from '../../database/entities';
import { FamilyAccessModule } from '../family-access/family-access.module';
import { MemoriesController } from './memories.controller';
import { MemoriesService } from './memories.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemoryEntity,
      MemoryCommentEntity,
      MemoryReactionEntity,
      UserAccountEntity,
    ]),
    FamilyAccessModule,
  ],
  controllers: [MemoriesController],
  providers: [MemoriesService],
})
export class MemoriesModule {}
