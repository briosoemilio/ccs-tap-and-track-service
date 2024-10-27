import { Injectable } from '@nestjs/common';
import { CreateComputerLogDto } from './dto/create-computer-log.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ComputerLogService {
  constructor(private prisma: PrismaService) {}

  async create(createComputerLogDto: CreateComputerLogDto) {
    const data = {
      uuid: uuidv4(),
      ...createComputerLogDto,
    };
    const newLog = await this.prisma.computerLog.create({ data });
    return newLog;
  }

  findAll() {
    return `This action returns all computerLog`;
  }

  async findByUUID(uuid: string) {
    const log = await this.prisma.computerLog.findUnique({ where: { uuid } });
    return log;
  }

  async endComputerLog(id: number) {
    const updatedLog = await this.prisma.computerLog.update({
      where: { id },
      data: { endedAt: new Date() },
    });
    return updatedLog;
  }

  remove(id: number) {
    return `This action removes a #${id} computerLog`;
  }
}
