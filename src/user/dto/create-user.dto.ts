import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @IsString()
  @IsOptional()
  yearSection?: string;

  @IsString()
  @IsOptional()
  studentNumber?: string;

  @IsString()
  @IsOptional()
  idNumber?: string;
}
