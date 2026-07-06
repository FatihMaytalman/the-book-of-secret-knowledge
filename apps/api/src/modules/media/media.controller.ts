import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { IsOptional, IsUUID } from 'class-validator';
import { ImportImmichAssetDto } from './dto/import-immich-asset.dto';
import { SyncImmichAssetsDto } from './dto/sync-immich-assets.dto';
import { ImmichClientError } from './immich.client';
import { MediaService } from './media.service';
import { MediaSyncService } from './media-sync.service';

class FamilyScopeQuery {
  @IsOptional()
  @IsUUID()
  familyId?: string;
}

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly mediaSyncService: MediaSyncService,
  ) {}

  @Get()
  listMediaAssets(@Query() query: FamilyScopeQuery) {
    return this.mediaService.listMediaAssets(query.familyId);
  }

  @Get('deduplication-candidates')
  listDeduplicationCandidates(@Query() query: FamilyScopeQuery) {
    return this.mediaService.listDeduplicationCandidates(query.familyId);
  }

  @Get('sync/immich/status')
  async getImmichSyncStatus(@Query() query: FamilyScopeQuery) {
    if (!query.familyId) {
      return {
        configured: this.mediaSyncService.isImmichConfigured(),
        state: null,
      };
    }

    const state = await this.mediaSyncService.getSyncState(query.familyId);
    return {
      configured: this.mediaSyncService.isImmichConfigured(),
      state,
    };
  }

  @Post('sync/immich')
  @HttpCode(HttpStatus.OK)
  async syncImmichAssets(@Body() body: SyncImmichAssetsDto) {
    if (!this.mediaSyncService.isImmichConfigured()) {
      throw new ServiceUnavailableException(
        'Immich sync is not configured. Set IMMICH_URL and IMMICH_API_KEY.',
      );
    }

    try {
      return await this.mediaSyncService.syncImmichAssets(body.familyId);
    } catch (error) {
      if (error instanceof ImmichClientError) {
        throw new ServiceUnavailableException(error.message);
      }

      throw error;
    }
  }

  @Post('immich/import')
  importImmichAsset(@Body() input: ImportImmichAssetDto) {
    return this.mediaService.importImmichAsset(input);
  }
}
