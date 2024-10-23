import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  metadata?: string;

  @IsInt()
  @IsNotEmpty()
  categoryName: string;

  @IsInt()
  @IsNotEmpty()
  locationName: string;
}
