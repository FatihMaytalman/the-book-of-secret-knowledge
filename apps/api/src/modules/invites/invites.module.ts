import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FamilyInviteEntity,
  FamilyMembershipEntity,
  UserAccountEntity,
} from '../../database/entities';
import { FamilyAccessModule } from '../family-access/family-access.module';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FamilyInviteEntity,
      FamilyMembershipEntity,
      UserAccountEntity,
    ]),
    FamilyAccessModule,
  ],
  controllers: [InvitesController],
  providers: [InvitesService],
  exports: [InvitesService],
})
export class InvitesModule {}
