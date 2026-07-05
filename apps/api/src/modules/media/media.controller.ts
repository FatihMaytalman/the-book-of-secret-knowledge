import { Controller, Get } from '@nestjs/common';

import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  listMediaAssets() {
    return this.mediaService.listMediaAssets();
  }

  @Get('deduplication-candidates')
  listDeduplicationCandidates() {
    return this.mediaService.listDeduplicationCandidates();
  }
}
