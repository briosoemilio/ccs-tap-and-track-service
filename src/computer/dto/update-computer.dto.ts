import { PartialType } from '@nestjs/mapped-types';
import { CreateComputerDto } from './create-computer.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateComputerLocationDto extends PartialType(CreateComputerDto) {
  @IsString()
  @IsNotEmpty()
  locationName?: string;
}
