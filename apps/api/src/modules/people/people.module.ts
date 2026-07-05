import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonEntity, PersonNameEntity } from '../../database/entities';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PersonEntity, PersonNameEntity]),
    AuditModule,
  ],
  exports: [TypeOrmModule, AuditModule],
})
export class PeopleModule {}
