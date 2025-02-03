import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  cardKey: string;
}
