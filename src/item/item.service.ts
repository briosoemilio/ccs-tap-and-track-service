import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { Item, ItemStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  async create(createItemDto: CreateItemDto) {
    const data = {
      uuid: uuidv4(),
      ...createItemDto,
    };
    const newItem = await this.prisma.item.create({ data });
    return newItem;
  }

  async findAll() {
    const allItems: Item[] = await this.prisma.item.findMany();
    return allItems;
  }

  async findByName(name: string) {
    const item = await this.prisma.item.findUnique({ where: { name } });
    return item;
  }

  async findByID(id: number) {
    const item = await this.prisma.item.findUnique({ where: { id } });
    return item;
  }

  async findByCategory(categoryName: string) {
    const items = await this.prisma.item.findMany({
      where: { categoryName },
    });
    return items;
  }

  async findByComputerId(computerId: number) {
    const items = await this.prisma.item.findMany({
      where: { computerId },
    });
    return items;
  }

  async updateItemStatus(id: number, status: ItemStatus) {
    const item = await this.prisma.item.findUnique({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`Item not found with ID: ${id}`);
    }

    const updatedItem = await this.prisma.item.update({
      where: { id },
      data: { status },
    });
    return updatedItem;
  }

  async updateItemLocation(id: number, locationName: string) {
    const item = await this.prisma.item.findUnique({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`Item not found with ID: ${id}`);
    }

    const updatedItem = await this.prisma.item.update({
      where: { id },
      data: { locationName },
    });
    return updatedItem;
  }

  async updateItemComputerId(itemId: number, computerId: number) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      throw new NotFoundException(`Item not found with ID: ${itemId}`);
    }

    const updatedItem = await this.prisma.item.update({
      where: { id: itemId },
      data: { computerId },
    });
    return updatedItem;
  }
}
