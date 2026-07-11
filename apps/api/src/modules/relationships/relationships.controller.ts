import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRelationshipDto, RelationshipsService } from './relationships.service';

@Controller('relationships')
@UseGuards(JwtAuthGuard)
export class RelationshipsController {
  constructor(private readonly relationshipsService: RelationshipsService) {}

  @Get()
  listRelationships(
    @Query('familyId') familyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.relationshipsService.listRelationships(familyId, user.userId);
  }

  @Post()
  @HttpCode(201)
  createRelationship(
    @Body() dto: CreateRelationshipDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.relationshipsService.createRelationship(dto, user.userId);
  }

  @Get('gedcom')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="family.ged"')
  exportGedcom(
    @Query('familyId') familyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.relationshipsService.exportGedcom(familyId, user.userId);
  }
}
