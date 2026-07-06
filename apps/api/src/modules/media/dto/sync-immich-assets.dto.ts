import { IsUUID } from 'class-validator';

export class SyncImmichAssetsDto {
  @IsUUID()
  familyId!: string;
}
