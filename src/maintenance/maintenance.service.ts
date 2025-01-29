import { Injectable } from '@nestjs/common';
import { Maintenance } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async create(createMaintenanceDto: {
    computerId: number;
    scheduleDate: Date;
    scheduledBy: number;
  }) {
    const data = {
      uuid: uuidv4(),
      ...createMaintenanceDto,
    };
    const maintenance = await this.prisma.maintenance.create({
      data,
    });
    return maintenance;
  }

  async findAll(page: number, itemsPerPage: number) {
    const skip = (page - 1) * itemsPerPage;
    const maintenance = await this.prisma.maintenance.findMany({
      skip: skip,
      take: itemsPerPage,
    });
    const total = await this.prisma.maintenance.count();
    return {
      data: maintenance || [],
      total: total || 0,
      page,
      itemsPerPage,
    };
  }
}
