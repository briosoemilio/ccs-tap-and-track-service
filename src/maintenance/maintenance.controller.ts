import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { JwtService } from '@nestjs/jwt';
import { formatResponse } from 'src/utils/formatResponse';
import { Role } from '@prisma/client';
import { UserService } from 'src/user/user.service';

@Controller('maintenance')
export class MaintenanceController {
  constructor(
    private readonly maintenanceService: MaintenanceService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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

    // Create Maintenance
    const user = await this.userService.findByUUID(decodedToken?.uuid);
    const reqBody = {
      ...createMaintenanceDto,
      scheduledBy: user?.id,
    };
    const maintenance = await this.maintenanceService.create(reqBody);

    return formatResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Maintenance created successfully',
      data: maintenance,
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
}
