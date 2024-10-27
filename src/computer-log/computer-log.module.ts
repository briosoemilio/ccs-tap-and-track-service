import { Module } from '@nestjs/common';
import { ComputerLogService } from './computer-log.service';
import { ComputerLogController } from './computer-log.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { ComputerService } from 'src/computer/computer.service';

@Module({
  controllers: [ComputerLogController],
  providers: [PrismaService, ComputerLogService, UserService, ComputerService],
})
export class ComputerLogModule {}
