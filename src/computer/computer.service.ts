import { Injectable } from '@nestjs/common';
import { CreateComputerDto } from './dto/create-computer.dto';
import { UpdateComputerDto } from './dto/update-computer.dto';
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

  findAll() {
    return `This action returns all computer`;
  }

  async findByName(name: string) {
    const computer = await this.prisma.computer.findUnique({ where: { name } });
    return computer;
  }

  async findById(id: number) {
    const computer = await this.prisma.computer.findUnique({ where: { id } });
    return computer;
  }

  update(id: number, updateComputerDto: UpdateComputerDto) {
    return `This action updates a #${id} computer`;
  }

  remove(id: number) {
    return `This action removes a #${id} computer`;
  }
}
