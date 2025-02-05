import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpStatus,
  Query,
  NotFoundException,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { ComputerService } from './computer.service';
import { CreateComputerDto } from './dto/create-computer.dto';
import { UpdateComputerLocationDto } from './dto/update-computer.dto';
import { ComputerValidator } from './validators/computer-validator';
import { formatResponse } from 'src/utils/formatResponse';
import { ItemService } from 'src/item/item.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationService } from 'src/location/location.service';
import { ComputerLogService } from 'src/computer-log/computer-log.service';
import { ItemStatus, Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Controller('computers')
export class ComputerController {
  private computerValidator: ComputerValidator;
  constructor(
    private readonly prisma: PrismaService,
    private readonly computerService: ComputerService,
    private readonly itemService: ItemService,
    private readonly locationService: LocationService,
    private readonly computerLogService: ComputerLogService,
    private readonly jwtService: JwtService,
  ) {
    this.computerValidator = new ComputerValidator(
      this.itemService,
      this.computerService,
      this.locationService,
    );
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createComputerDto: CreateComputerDto) {
    const {
      name,
      monitorName,
      keyboardName,
      mouseName,
      systemUnitName,
      others = [],
      locationName,
    } = createComputerDto;

    // Items Array
    const items = [
      monitorName,
      keyboardName,
      mouseName,
      systemUnitName,
      ...others,
    ];

    // Start a transaction
    return await this.prisma.$transaction(async () => {
      // Validate request body
      await this.computerValidator.validateItemNames(items);

      // Check if computer name is taken
      await this.computerValidator.validateComputerName(name);

      // Check if location does exist
      await this.computerValidator.validateLocationName(locationName);

      // Create new computer
      const newComputer = await this.computerService.create(createComputerDto);

      // Update items
      await this.computerValidator.updateItems(
        items,
        newComputer.id,
        locationName,
      );

      // Return response
      return formatResponse({
        statusCode: HttpStatus.CREATED,
        message: 'Computer created successfully',
        data: newComputer,
      });
    });
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('itemsPerPage') itemsPerPage: string = '10',
  ) {
    const computers = await this.computerService.findAll(
      parseInt(page),
      parseInt(itemsPerPage),
    );
    return formatResponse({
      statusCode: HttpStatus.FOUND,
      message: 'Computers list successfully fetched',
      data: computers,
    });
  }

  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string) {
    const computer = await this.computerService.findByIdentifier(identifier);
    if (!computer)
      throw new NotFoundException(`Computer not found : ${identifier}.`);

    return formatResponse({
      statusCode: HttpStatus.FOUND,
      message: `Computer fetched with name : ${identifier}`,
      data: computer,
    });
  }

  @Get('/status/:identifier')
  async getStatus(@Param('identifier') identifier: string) {
    const computer = await this.computerService.findByIdentifier(identifier);
    if (!computer)
      throw new NotFoundException(`Computer not found : ${identifier}.`);
    let computerStatus: ItemStatus = ItemStatus.AVAILABLE;

    const lastLog = computer?.lastLogUUID;
    if (lastLog) {
      const computerLog = await this.computerLogService.findByUUID(lastLog);
      const endedAt = computerLog.endedAt;
      if (endedAt === null) {
        computerStatus = ItemStatus.IN_USE;
      }
    }

    const checkPC = await this.computerService.checkIfInRepair(computer.id);
    const { inRepair, inRepairComponents } = checkPC;
    if (inRepair) {
      computerStatus = ItemStatus.UNDER_MAINTENANCE;
    }

    return formatResponse({
      statusCode: HttpStatus.FOUND,
      message: `Computer status with identifier : ${identifier}`,
      data: { computerStatus, inRepairComponents },
    });
  }

  @Patch('/relocate/:id')
  @UsePipes(new ValidationPipe())
  async relocateComputer(
    @Param('id') id: string,
    @Body() updateComputerLocationDto: UpdateComputerLocationDto,
  ) {
    return await this.prisma.$transaction(async () => {
      // Initialize Location Name
      const locationName = updateComputerLocationDto.locationName;
      const computer = await this.computerService.findById(parseInt(id));
      if (computer.locationName === locationName)
        throw new BadRequestException(
          `Computer : ${computer.name} is already located at : ${locationName}`,
        );

      const relocatedComputer = await this.computerService.updateLocation(
        parseInt(id),
        locationName,
      );

      // Update items included in the pc:
      const itemsIncluded = await this.itemService.findByComputerId(
        parseInt(id),
      );
      await Promise.all(
        itemsIncluded.map(
          async (item) =>
            await this.itemService.updateItemLocation(item.id, locationName),
        ),
      );

      return formatResponse({
        statusCode: HttpStatus.OK,
        message: `Computer: ${id} successfully changed location : ${locationName}`,
        data: relocatedComputer,
      });
    });
  }

  @Patch('/archive/:identifier')
  async archiveItem(@Param('identifier') identifier: string, @Request() req) {
    // check if admin
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const decodedToken = await this.jwtService.decode(bearerToken);
    const role = decodedToken?.role;
    if (![Role.ADMIN, Role.SUPER_ADMIN].includes(role)) {
      throw new BadRequestException(
        'Unauthorized. Archive is only available to ADMIN accounts',
      );
    }

    const computer = await this.computerService.findByIdentifier(identifier);
    if (!computer) {
      throw new BadRequestException(
        `Bad Request. Computer not found with identifier: ${identifier}`,
      );
    }

    const updatedComputer = await this.computerService.archiveComputer(
      computer?.id,
    );

    return formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Computer archived successfully',
      data: updatedComputer,
    });
  }

  @Patch('/unarchive/:identifier')
  async unarchiveItem(@Param('identifier') identifier: string, @Request() req) {
    // check if admin
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const decodedToken = await this.jwtService.decode(bearerToken);
    const role = decodedToken?.role;
    if (![Role.ADMIN, Role.SUPER_ADMIN].includes(role)) {
      throw new BadRequestException(
        'Unauthorized. Unarchive is only available to ADMIN accounts',
      );
    }

    const computer = await this.computerService.findByIdentifier(identifier);
    if (!computer) {
      throw new BadRequestException(
        `Bad Request. Computer not found with identifier: ${identifier}`,
      );
    }

    const updatedComputer = await this.computerService.unarchiveComputer(
      computer?.id,
    );

    return formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Computer unarchived successfully',
      data: updatedComputer,
    });
  }
}
