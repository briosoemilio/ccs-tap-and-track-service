import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReportDto {
  @IsNumber()
  @IsNotEmpty()
  itemId: number;

  @IsNumber()
  @IsNotEmpty()
  reportedBy: number;

  @IsString()
  @IsNotEmpty()
  remarks: string;
}
