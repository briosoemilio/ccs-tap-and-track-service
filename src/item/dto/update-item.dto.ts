import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import { IsNotEmpty } from 'class-validator';
import { ItemStatus } from '@prisma/client';

export class ChangeItemStatusDto extends PartialType(CreateItemDto) {
  @IsNotEmpty()
  status: ItemStatus;
}

export class ChangeItemLocationDto extends PartialType(CreateItemDto) {
  @IsNotEmpty()
  locationId: number;
}
