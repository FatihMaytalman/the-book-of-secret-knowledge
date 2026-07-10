import {
  BadRequestException,
  Body,
  Controller,
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
import { CreatePersonDto } from './dto/create-person.dto';
import { PeopleService } from './people.service';

@Controller('people')
@UseGuards(JwtAuthGuard)
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  listPeople(
    @CurrentUser() user: AuthenticatedUser,
    @Query('familyId') familyId?: string,
  ) {
    if (!familyId) {
      throw new BadRequestException('familyId query parameter is required.');
    }
    return this.peopleService.listPeople(familyId, user.userId);
  }

  @Get(':id')
  getPerson(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.peopleService.getPerson(id, user.userId);
  }

  @Post()
  @HttpCode(201)
  createPerson(@Body() dto: CreatePersonDto, @CurrentUser() user: AuthenticatedUser) {
    return this.peopleService.createPerson(dto, user.userId);
  }
}
