import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';

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
  createPerson(@Body() dto: CreatePersonDto) {
    return this.peopleService.createPerson(dto);
  }
}
