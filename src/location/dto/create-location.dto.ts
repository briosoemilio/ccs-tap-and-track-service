import { IsString, IsNotEmpty } from 'class-validator';
import { FloorType } from '@prisma/client';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  floor: FloorType;
}
