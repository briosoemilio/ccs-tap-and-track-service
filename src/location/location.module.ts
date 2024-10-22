import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [LocationController],
  providers: [PrismaService, LocationService],
})
export class LocationModule {}
