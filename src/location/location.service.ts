import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Location } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto) {
    const data = {
      uuid: uuidv4(),
      name: createLocationDto.name.toUpperCase(),
      floor: createLocationDto.floor,
    };
    const location: Location = await this.prisma.location.create({
      data,
    });
    return location;
  }

  async findAll(page: number, itemsPerPage: number) {
    const skip = (page - 1) * itemsPerPage;
    const allLocations = await this.prisma.location.findMany({
      skip: skip,
      take: itemsPerPage,
    });
    const totalLocations = await this.prisma.location.count();
    return {
      data: allLocations || [],
      total: totalLocations || 0,
      page,
      itemsPerPage,
    };
  }

  async findByName(name: string) {
    const location: Location = await this.prisma.location.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });
    return location;
  }
}
