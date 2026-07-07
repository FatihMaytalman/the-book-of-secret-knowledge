import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFamilyDto } from './dto/create-family.dto';
import { FamiliesService } from './families.service';

@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  listFamilies(@CurrentUser() user: AuthenticatedUser) {
    return this.familiesService.listFamilies(user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getFamily(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.familiesService.getFamily(id, user.userId);
  }

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  createFamily(@Body() dto: CreateFamilyDto, @CurrentUser() user: AuthenticatedUser) {
    return this.familiesService.createFamily(dto, user.userId);
  }
}
