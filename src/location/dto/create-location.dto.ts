import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { FloorType } from '@prisma/client';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(FloorType)
  @IsNotEmpty()
  floor: FloorType;
}
