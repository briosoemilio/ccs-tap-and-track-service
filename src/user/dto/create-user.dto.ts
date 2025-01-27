import { Role } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
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

export class ChangeSectionDto {
  @IsNotEmpty()
  @IsString()
  section: string;
}
