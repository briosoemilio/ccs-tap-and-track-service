import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ComputerLogService } from './computer-log.service';
import { ComputerLogController } from './computer-log.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { ComputerService } from 'src/computer/computer.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ComputerLogController],
  providers: [
    PrismaService,
    ComputerLogService,
    UserService,
    ComputerService,
    JwtService,
  ],
})
export class ComputerLogModule {}
