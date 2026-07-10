import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AiService, type HeritageAssistResponse } from './ai.service';

class HeritageAssistDto {
  @IsString()
  @MinLength(4)
  @MaxLength(4000)
  prompt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  familyContext?: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('health')
  getHealth() {
    return this.aiService.getHealth();
  }

  @Post('assist')
  assist(@Body() body: HeritageAssistDto): Promise<HeritageAssistResponse> {
    return this.aiService.assist(body);
  }
}
