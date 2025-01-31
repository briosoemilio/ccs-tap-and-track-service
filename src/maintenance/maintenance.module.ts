import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { ItemService } from 'src/item/item.service';

@Module({
  providers: [
    PrismaService,
    MaintenanceService,
    JwtService,
    UserService,
    ItemService,
  ],
  controllers: [MaintenanceController],
})
export class MaintenanceModule {}
