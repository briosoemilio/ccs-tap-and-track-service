import { Injectable } from '@nestjs/common';
import { CreateComputerLogDto } from './dto/create-computer-log.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';
import { isIntegerString } from 'src/utils/isInteger';
import { isIdentifierUUID } from 'src/utils/isIdentifierUUID';

@Injectable()
export class ComputerLogService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, computerId: number) {
    const data = {
      uuid: uuidv4(),
      userId,
      computerId,
    };
    const newLog = await this.prisma.computerLog.create({ data });
    return newLog;
  }

  async findAll(page: number, itemsPerPage: number) {
    const skip = (page - 1) * itemsPerPage;
    const logs = await this.prisma.computerLog.findMany({
      skip: skip,
      take: itemsPerPage,
    });
    const totalLogs = await this.prisma.computerLog.count();
    return {
      data: logs || [],
      total: totalLogs || 0,
      page,
      itemsPerPage,
    };
  }

  async findByID(id: number) {
    const log = await this.prisma.computerLog.findUnique({ where: { id } });
    return log;
  }

  async findByUUID(uuid: string) {
    const log = await this.prisma.computerLog.findUnique({ where: { uuid } });
    return log;
  }

  async endComputerLog(id: number, endedBy: number) {
    const updatedLog = await this.prisma.computerLog.update({
      where: { id },
      data: { endedAt: new Date(), endedBy },
    });
    return updatedLog;
  }

  async findByIdentifier(identifier: string) {
    // if identifier is id
    if (isIntegerString(identifier)) {
      return await this.findByID(parseInt(identifier));
    }

    // if identifier is uuid
    if (isIdentifierUUID(identifier)) {
      return await this.findByUUID(identifier);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} computerLog`;
  }
}
