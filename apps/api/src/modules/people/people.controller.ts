import {
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
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  listPeople(@Query('familyId') familyId?: string) {
    return this.peopleService.listPeople(familyId);
  }

  @Get(':id')
  getPerson(@Param('id') id: string) {
    return this.peopleService.getPerson(id);
  }

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  createPerson(@Body() dto: CreatePersonDto, @CurrentUser() user: AuthenticatedUser) {
    return this.peopleService.createPerson(dto, user.userId);
  }
}
