import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { MediaService } from './media.service';
import { ImportImmichAssetDto } from './dto/import-immich-asset.dto';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  listMediaAssets(@Query('familyId') familyId?: string) {
    return this.mediaService.listMediaAssets(familyId);
  }

  @Get('deduplication-candidates')
  listDeduplicationCandidates() {
    return this.mediaService.listDeduplicationCandidates();
  }

  @Post('immich/import')
  importImmichAsset(@Body() input: ImportImmichAssetDto) {
    return this.mediaService.importImmichAsset(input);
  }
}
