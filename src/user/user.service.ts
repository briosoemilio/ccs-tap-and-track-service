import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );
    const data = {
      uuid: uuidv4(),
      ...createUserDto,
      password: hashedPassword,
    };
    const user = await this.prisma.user.create({ data });
    return user;
  }

  async findAll(page: number, itemsPerPage: number) {
    const skip = (page - 1) * itemsPerPage;
    const users = await this.prisma.user.findMany({
      skip: skip,
      take: itemsPerPage,
    });
    const totalUsers = await this.prisma.user.count();
    return {
      data: users || [],
      total: totalUsers || 0,
      page,
      itemsPerPage,
    };
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user;
  }

  async findByRole(role: Role, page: number, itemsPerPage: number) {
    const skip = (page - 1) * itemsPerPage;
    const userByRole = await this.prisma.user.findMany({
      where: { role },
      skip,
      take: itemsPerPage,
    });
    const total = userByRole.length;
    return {
      data: userByRole || [],
      total,
      page,
      itemsPerPage,
    };
  }
}
