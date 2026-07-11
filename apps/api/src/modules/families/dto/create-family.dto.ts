import { IsOptional, IsString, Length } from 'class-validator';

export class CreateFamilyDto {
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(2, 60)
  slug?: string;
}
