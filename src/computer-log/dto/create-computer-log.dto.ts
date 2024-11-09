import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateComputerLogDto {
  @IsNumber()
  @IsNotEmpty()
  computerId: number;
}
