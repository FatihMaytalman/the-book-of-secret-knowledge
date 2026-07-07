import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FamilyEntity,
  FamilyMembershipEntity,
  MediaAssetEntity,
} from '../../database/entities';
import { AuditModule } from '../audit/audit.module';
import { FamiliesController } from './families.controller';
import { FamiliesService } from './families.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FamilyEntity,
      FamilyMembershipEntity,
      MediaAssetEntity,
    ]),
    AuditModule,
  ],
  controllers: [FamiliesController],
  providers: [FamiliesService],
  exports: [TypeOrmModule, AuditModule, FamiliesService],
})
export class FamiliesModule {}
