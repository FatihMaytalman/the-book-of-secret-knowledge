import { Controller, Get } from '@nestjs/common';

import type { SocialService } from './social.service';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('connections')
  listConnections() {
    return this.socialService.listConnections();
  }

  @Get('provenance')
  listImportedProvenance() {
    return this.socialService.listImportedProvenance();
  }
}
