import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyEntity, FamilyMembershipEntity } from '../../database/entities';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FamilyEntity, FamilyMembershipEntity]),
    AuditModule,
  ],
  exports: [TypeOrmModule, AuditModule],
})
export class FamiliesModule {}
