import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateInviteDto, InvitesService } from './invites.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Get('families/:familyId/members')
  listMembers(
    @Param('familyId') familyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.invitesService.listMembers(familyId, user.userId);
  }

  @Get('families/:familyId/invites')
  listInvites(
    @Param('familyId') familyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.invitesService.listInvites(familyId, user.userId);
  }

  @Post('invites')
  @HttpCode(201)
  createInvite(@Body() dto: CreateInviteDto, @CurrentUser() user: AuthenticatedUser) {
    return this.invitesService.createInvite(dto, user.userId);
  }

  @Delete('invites/:id')
  @HttpCode(204)
  async cancelInvite(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.invitesService.cancelInvite(id, user.userId);
  }

  @Post('invites/accept')
  async acceptInvite(
    @Body('token') token: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const familyId = await this.invitesService.acceptInviteByToken(token, user.userId);
    return { familyId };
  }
}
