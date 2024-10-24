import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateComputerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  metadata?: string;

  @IsString()
  @IsNotEmpty()
  monitorName: string;

  @IsString()
  @IsNotEmpty()
  keyboardName: string;

  @IsString()
  @IsNotEmpty()
  mouseName: string;

  @IsString()
  @IsNotEmpty()
  systemUnitName: string;

  @IsString()
  @IsNotEmpty()
  locationName: string;

  @IsOptional()
  @IsArray()
  others?: string[];
}
