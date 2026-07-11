import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(1, 200)
  displayName!: string;

  @IsString()
  @Length(8, 200)
  password!: string;
}
