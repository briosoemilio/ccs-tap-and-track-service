import { Injectable } from '@nestjs/common';
import { CreateComputerDto } from './dto/create-computer.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { isIntegerString } from 'src/utils/isInteger';
import { isIdentifierUUID } from 'src/utils/isIdentifierUUID';
import { ItemStatus } from '@prisma/client';

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

  async findByIdentifier(identifier: string) {
    // if identifier is id
    if (isIntegerString(identifier)) {
      return await this.findById(parseInt(identifier));
    }

    // if identifier is uuid
    if (isIdentifierUUID(identifier)) {
      return await this.findByUUID(identifier);
    }

    // if identifier is name
    return await this.findByName(identifier);
  }

  async checkIfInRepair(id: number) {
    const computer = await this.prisma.computer.findUnique({ where: { id } });
    const { keyboardName, monitorName, mouseName, systemUnitName, others } =
      computer;
    const componentNames = [
      keyboardName,
      monitorName,
      mouseName,
      systemUnitName,
      ...others,
    ];

    const components = await this.prisma.item.findMany({
      where: {
        name: { in: componentNames },
      },
      select: { id: true, name: true, uuid: true, status: true },
    });

    const inRepairComponents = components.filter((component) => {
      if (component.status === ItemStatus.UNDER_MAINTENANCE) return component;
    });
    const inRepair = inRepairComponents.length > 0;

    return { inRepair, inRepairComponents };
  }

  async archiveComputer(id: number) {
    return this.prisma.computer.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async unarchiveComputer(id: number) {
    return this.prisma.computer.update({
      where: { id },
      data: { isArchived: false },
    });
  }
}
