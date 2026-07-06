import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { PeopleService } from './people.service';

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  listPeople() {
    return this.peopleService.listPeople();
  }

  @Get(':id')
  getPerson(@Param("id") id: string) {
    const person = this.peopleService.getPerson(id);

    if (!person) {
      throw new NotFoundException(`Person not found: ${id}`);
    }

    return person;
  }
}
