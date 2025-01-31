import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { JwtService } from '@nestjs/jwt';
import { formatResponse } from 'src/utils/formatResponse';
import { ItemStatus, Role } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ItemService } from 'src/item/item.service';

@Controller('maintenance')
export class MaintenanceController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly maintenanceService: MaintenanceService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly itemService: ItemService,
  ) {}

  @Post()
  async create(
    @Body() createMaintenanceDto: { computerId: number; scheduleDate: Date },
    @Request() req,
  ) {
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const decodedToken = await this.jwtService.decode(bearerToken);
    const role = decodedToken?.role;
    if (![Role.ADMIN, Role.SUPER_ADMIN].includes(role)) {
      throw new BadRequestException(
        'Unauthorized. Maintenance is only available to ADMIN accounts',
      );
    }

    return await this.prisma.$transaction(async () => {
      // Create Maintenance
      const user = await this.userService.findByUUID(decodedToken?.uuid);
      const reqBody = {
        ...createMaintenanceDto,
        scheduledBy: user?.id,
      };
      const maintenance = await this.maintenanceService.create(reqBody);

      // Update item statuses
      await this.itemService.updateStatusItems(
        createMaintenanceDto?.computerId,
        ItemStatus.UNDER_MAINTENANCE,
      );

      return formatResponse({
        statusCode: HttpStatus.CREATED,
        message: 'Maintenance created successfully',
        data: maintenance,
      });
    });
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('itemsPerPage') itemsPerPage: string = '10',
  ) {
    const maintenance = await this.maintenanceService.findAll(
      parseInt(page),
      parseInt(itemsPerPage),
    );

    return formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Maintenance fetched successfully',
      data: maintenance,
    });
  }

  @Patch('/mark-as-done/:id')
  async markAsDone(@Param('id') id: string, @Request() req) {
    // check if admin
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const decodedToken = await this.jwtService.decode(bearerToken);
    const role = decodedToken?.role;
    if (![Role.ADMIN, Role.SUPER_ADMIN].includes(role)) {
      throw new BadRequestException(
        'Unauthorized. Archive is only available to ADMIN accounts',
      );
    }

    const maintenance = await this.maintenanceService.findById(id);
    if (!maintenance) {
      throw new BadRequestException(
        `Bad Request. maintenance not found with id: ${id}`,
      );
    }

    return await this.prisma.$transaction(async () => {
      // update maintenance
      const updatedMaintenance = await this.maintenanceService.markAsDone(id);

      // update item status
      await this.itemService.updateStatusItems(
        maintenance?.computerId,
        ItemStatus.IN_USE,
      );

      return formatResponse({
        statusCode: HttpStatus.OK,
        message: 'Maintenance marked as done successfully',
        data: updatedMaintenance,
      });
    });
  }
}
