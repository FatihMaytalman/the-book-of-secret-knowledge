import {
  IsIn,
  IsInt,
  IsISO8601,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

const supportedMediaTypes = ['image', 'video', 'audio', 'document', 'other'] as const;

export class ImportImmichAssetDto {
  @IsUUID()
  familyId!: string;

  @IsString()
  @Length(1, 256)
  immichAssetId!: string;

  @IsString()
  @Length(64, 64)
  sha256!: string;

  @IsIn(supportedMediaTypes)
  mediaType!: (typeof supportedMediaTypes)[number];

  @IsInt()
  @Min(0)
  byteSize!: number;

  @IsString()
  @Length(1, 2048)
  storageUri!: string;

  @IsString()
  @Length(1, 512)
  originalFilename!: string;

  @IsOptional()
  @IsUUID()
  uploadedByUserId?: string;

  @IsOptional()
  @IsISO8601()
  capturedAt?: string;

  @IsOptional()
  @IsObject()
  exif?: Record<string, unknown>;
}
