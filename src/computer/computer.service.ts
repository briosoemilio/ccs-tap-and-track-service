import { Injectable } from '@nestjs/common';
import { CreateComputerDto } from './dto/create-computer.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ComputerService {
  constructor(private prisma: PrismaService) {}

  async create(createComputerDto: CreateComputerDto) {
    const data = {
      uuid: uuidv4(),
      ...createComputerDto,
    };
    const newComputer = await this.prisma.computer.create({ data });
    return newComputer;
  }

  async findAll(page: number, itemsPerPage: number) {
    const skip = (page - 1) * itemsPerPage;
    const computers = await this.prisma.computer.findMany({
      skip: skip,
      take: itemsPerPage,
    });
    const totalComputers = await this.prisma.computer.count();
    return {
      data: computers || [],
      total: totalComputers || 0,
      page,
      itemsPerPage,
    };
  }

  async findByName(name: string) {
    const computer = await this.prisma.computer.findUnique({ where: { name } });
    return computer;
  }

  async findById(id: number) {
    const computer = await this.prisma.computer.findUnique({ where: { id } });
    return computer;
  }

  async findByUUID(uuid: string) {
    const computer = await this.prisma.computer.findUnique({ where: { uuid } });
    return computer;
  }

  async findByLocation(locationName: string) {
    const allComputers = await this.prisma.computer.findMany({
      where: { locationName },
    });
    return allComputers;
  }

  async updateLocation(id: number, locationName: string) {
    const relocatedComputer = await this.prisma.computer.update({
      where: { id },
      data: { locationName },
    });
    return relocatedComputer;
  }

  async updateLastLog(id: number, lastLogUUID: string) {
    const updatedComputer = await this.prisma.computer.update({
      where: { id },
      data: { lastLogUUID },
    });
    return updatedComputer;
  }
}
