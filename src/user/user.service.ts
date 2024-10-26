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
    console.log('1111')
    const saltOrRounds = 10;
    console.log('2222')
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );
    console.log('3333', hashedPassword)
    const data = {
      uuid: uuidv4(),
      ...createUserDto,
      password: hashedPassword,
    };
    console.log('4444', data)
    const user = await this.prisma.user.create({ data });
    console.log('5555', user)
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
