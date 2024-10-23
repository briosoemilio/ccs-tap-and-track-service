import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ItemController],
  providers: [PrismaService, ItemService],
})
export class ItemModule {}
