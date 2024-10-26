import { IsString, IsNotEmpty, IsEnum, IsEmail } from 'class-validator';
import { FloorType } from '@prisma/client';

export class CreateAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
