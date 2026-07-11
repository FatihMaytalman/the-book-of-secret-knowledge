import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyMembershipEntity } from '../../database/entities';
import { FamilyAccessService } from './family-access.service';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyMembershipEntity])],
  providers: [FamilyAccessService],
  exports: [FamilyAccessService],
})
export class FamilyAccessModule {}
