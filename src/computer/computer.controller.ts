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
} from '@nestjs/common';
import { ComputerService } from './computer.service';
import { CreateComputerDto } from './dto/create-computer.dto';
import { UpdateComputerLocationDto } from './dto/update-computer.dto';
import { ComputerValidator } from './validators/computer-validator';
import { formatResponse } from 'src/utils/formatResponse';
import { ItemService } from 'src/item/item.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationService } from 'src/location/location.service';
import { isIntegerString } from 'src/utils/isInteger';
import { isIdentifierUUID } from 'src/utils/isIdentifierUUID';

@Controller('computers')
export class ComputerController {
  private computerValidator: ComputerValidator;
  constructor(
    private readonly prisma: PrismaService,
    private readonly computerService: ComputerService,
    private readonly itemService: ItemService,
    private readonly locationService: LocationService,
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
}
