import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { isIntegerString } from 'src/utils/isInteger';
import { isIdentifierUUID } from 'src/utils/isIdentifierUUID';
import { isIdentifierEmail } from 'src/utils/isIdentifierEmail';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, idNumber, password } = createUserDto;
    await this.validateUser(email, idNumber);

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
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

  async findByUUID(uuid: string) {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    return user;
  }

  async findByIDNumber(idNumber: string) {
    const user = await this.prisma.user.findUnique({ where: { idNumber } });
    return user;
  }

  async findByRole(role: Role, page: number, itemsPerPage: number) {
    const skip = (page - 1) * itemsPerPage;
    const userByRole = await this.prisma.user.findMany({
      where: { role },
      skip,
      take: itemsPerPage,
    });

    const total = await this.prisma.user.count({
      where: { role },
    });

    return {
      data: userByRole || [],
      total,
      page,
      itemsPerPage,
    };
  }

  async findByEmail(email: string) {
    const userByEmail = await this.prisma.user.findFirst({ where: { email } });
    return userByEmail;
  }

  async findByIdNumber(idNumber: string) {
    const userByIdNumber = await this.prisma.user.findFirst({
      where: { idNumber },
    });
    return userByIdNumber;
  }

  async validateUser(email: string, idNumber: string) {
    const checkEmail = await this.findByEmail(email);
    if (checkEmail) {
      throw new BadRequestException(`Email already used : ${email}`);
    }

    const checkIdNumber = await this.findByIdNumber(idNumber);
    if (checkIdNumber) {
      throw new BadRequestException(
        `ID Number already used : ${checkIdNumber}`,
      );
    }
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

    if (isIdentifierEmail(identifier)) {
      return await this.findByEmail(identifier);
    }

    // if identifier is id number
    return await this.findByIdNumber(identifier);
  }

  async updateIsLogged(id: number, isLogged: boolean) {
    return await this.prisma.user.update({
      where: { id },
      data: { isLogged },
    });
  }

  async updateSection(id: number, yearSection: string) {
    return await this.prisma.user.update({
      where: { id },
      data: { yearSection },
    });
  }

  async updateMetadata(id: number, metadata: any) {
    return await this.prisma.user.update({
      where: { id },
      data: { metadata },
    });
  }

  async updatePassword(id: number, newPassword: string) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltOrRounds);
    return await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    // CHECK EMAIL
    if (updateUserDto?.email) {
      const user = await this.findByEmail(updateUserDto?.email);
      if (user && user?.id !== id)
        throw new BadRequestException(
          `Email already used : ${updateUserDto?.email}`,
        );
    }

    // CHECK ID NUMBER
    if (updateUserDto?.idNumber) {
      const user = await this.findByIDNumber(updateUserDto?.idNumber);
      if (user && user?.id !== id)
        throw new BadRequestException(
          `ID number already used : ${updateUserDto?.idNumber}`,
        );
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }
}
