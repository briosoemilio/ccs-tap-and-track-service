import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReportDto {
  @IsNumber()
  @IsNotEmpty()
  itemId: number;

  @IsString()
  @IsNotEmpty()
  remarks: string;
}
