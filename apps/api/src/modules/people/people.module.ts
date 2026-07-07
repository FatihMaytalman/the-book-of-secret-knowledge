import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FamilyEntity,
  PersonEntity,
  PersonNameEntity,
} from '../../database/entities';
import { AuditModule } from '../audit/audit.module';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PersonEntity, PersonNameEntity, FamilyEntity]),
    AuditModule,
  ],
  controllers: [PeopleController],
  providers: [PeopleService],
  exports: [TypeOrmModule, AuditModule, PeopleService],
})
export class PeopleModule {}
