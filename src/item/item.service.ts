import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { Item, ItemStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { isIntegerString } from 'src/utils/isInteger';
import { isIdentifierUUID } from 'src/utils/isIdentifierUUID';

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

  async findAll(
    page: number,
    itemsPerPage: number,
    categoryName: string,
    locationName: string,
    status: ItemStatus,
  ) {
    const skip = (page - 1) * itemsPerPage;
    const mainCategories = ['MOUSE', 'KEYBOARD', 'MONITOR', 'SYSTEM_UNIT'];

    const allItems: Item[] = await this.prisma.item.findMany({
      skip: skip,
      take: itemsPerPage,
      where: {
        ...(categoryName === 'OTHERS'
          ? { categoryName: { notIn: mainCategories } }
          : categoryName && { categoryName }),
        ...(locationName && { locationName }),
        ...(status && { status }),
      },
    });
    const totalItems = await this.prisma.item.count();
    return {
      data: allItems || [],
      total: totalItems || 0,
      page,
      itemsPerPage,
    };
  }

  async findByName(name: string) {
    const item = await this.prisma.item.findUnique({ where: { name } });
    return item;
  }

  async findByID(id: number) {
    const item = await this.prisma.item.findUnique({ where: { id } });
    return item;
  }

  async findByUUID(uuid: string) {
    const item = await this.prisma.item.findUnique({ where: { uuid } });
    return item;
  }

  async findByCategory(
    categoryName: string,
    page: number,
    itemsPerPage: number,
  ) {
    const skip = (page - 1) * itemsPerPage;
    const categoryItems: Item[] = await this.prisma.item.findMany({
      where: { categoryName },
      skip: skip,
      take: itemsPerPage,
    });
    const totalCategoryItems = await this.prisma.item.count({
      where: { categoryName },
    });
    return {
      data: categoryItems || [],
      total: totalCategoryItems || 0,
      page,
      itemsPerPage,
    };
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

  async findByIdentifier(identifier: string) {
    // if identifier is id
    if (isIntegerString(identifier)) {
      return await this.findByID(parseInt(identifier));
    }

    // if identifier is uuid
    if (isIdentifierUUID(identifier)) {
      return await this.findByUUID(identifier);
    }

    // if identifier is iteme name
    return await this.findByName(identifier);
  }

  async archiveItem(id: number) {
    return this.prisma.item.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async unarchiveItem(id: number) {
    return this.prisma.item.update({
      where: { id },
      data: { isArchived: false },
    });
  }

  async updateStatusItems(computerId: number, status: ItemStatus) {
    return this.prisma.item.updateMany({
      where: { computerId },
      data: { status },
    });
  }
}
