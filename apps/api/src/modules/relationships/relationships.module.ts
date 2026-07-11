import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PersonEntity,
  PersonNameEntity,
  RelationshipEdgeEntity,
} from '../../database/entities';
import { FamilyAccessModule } from '../family-access/family-access.module';
import { RelationshipsController } from './relationships.controller';
import { RelationshipsService } from './relationships.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RelationshipEdgeEntity,
      PersonEntity,
      PersonNameEntity,
    ]),
    FamilyAccessModule,
  ],
  controllers: [RelationshipsController],
  providers: [RelationshipsService],
})
export class RelationshipsModule {}
