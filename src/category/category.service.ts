import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const data = {
      uuid: uuidv4(),
      name: createCategoryDto.name.toUpperCase(),
    };
    const category: Category = await this.prisma.category.create({
      data,
    });
    return category;
  }

  async findAll() {
    const allCategories: Category[] = await this.prisma.category.findMany();
    return allCategories;
  }

  async findOne(name: string) {
    const category: Category = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });
    return category;
  }
}
