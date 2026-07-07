import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';

import { CreateFamilyDto } from './dto/create-family.dto';
import { FamiliesService } from './families.service';

@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Get()
  listFamilies() {
    return this.familiesService.listFamilies();
  }

  @Get(':id')
  getFamily(@Param('id') id: string) {
    return this.familiesService.getFamily(id);
  }

  @Post()
  @HttpCode(201)
  createFamily(@Body() dto: CreateFamilyDto) {
    return this.familiesService.createFamily(dto);
  }
}
