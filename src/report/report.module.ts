import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { ItemService } from 'src/item/item.service';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ReportController],
  providers: [
    ReportService,
    ItemService,
    UserService,
    PrismaService,
    JwtService,
  ],
})
export class ReportModule {}
