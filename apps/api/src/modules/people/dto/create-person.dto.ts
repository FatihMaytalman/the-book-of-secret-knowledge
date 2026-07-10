import {
  IsBoolean,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import type { PersonVisibility } from '@aomlegacy/shared';

const visibilities = ['family', 'restricted', 'private'] as const;

export class CreatePersonDto {
  @IsUUID()
  familyId!: string;

  @IsString()
  @Length(1, 200)
  displayName!: string;

  @IsOptional()
  @IsISO8601()
  birthDate?: string;

  @IsOptional()
  @IsISO8601()
  deathDate?: string;

  @IsOptional()
  @IsBoolean()
  isLiving?: boolean;

  @IsOptional()
  @IsIn(visibilities)
  visibility?: PersonVisibility;

  @IsOptional()
  @IsString()
  @Length(0, 5000)
  biography?: string;
}
