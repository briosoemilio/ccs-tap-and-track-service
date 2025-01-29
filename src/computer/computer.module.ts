import { Module } from '@nestjs/common';
import { ComputerService } from './computer.service';
import { ComputerController } from './computer.controller';
import { ItemService } from 'src/item/item.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationService } from 'src/location/location.service';
import { ComputerLogService } from 'src/computer-log/computer-log.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ComputerController],
  providers: [
    PrismaService,
    ItemService,
    ComputerService,
    LocationService,
    ComputerLogService,
    JwtService,
  ],
})
export class ComputerModule {}
