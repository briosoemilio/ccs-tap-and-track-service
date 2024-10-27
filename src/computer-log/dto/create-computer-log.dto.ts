import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateComputerLogDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  computerId: number;
}
