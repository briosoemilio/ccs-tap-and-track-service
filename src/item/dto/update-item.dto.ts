import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ItemStatus } from '@prisma/client';

export class ChangeItemStatusDto extends PartialType(CreateItemDto) {
  @IsNotEmpty()
  @IsEnum(ItemStatus)
  status: ItemStatus;
}

export class ChangeItemLocationDto extends PartialType(CreateItemDto) {
  @IsNotEmpty()
  locationName: string;
}
