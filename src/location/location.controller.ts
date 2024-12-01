import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  ValidationPipe,
  UsePipes,
  ConflictException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { formatResponse } from 'src/utils/formatResponse';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createLocationDto: CreateLocationDto) {
    const name = createLocationDto.name;
    const location = await this.locationService.findByName(name);
    if (location) {
      throw new ConflictException(`Location already exists: ${name}`);
    }
    const newLocation = await this.locationService.create(createLocationDto);
    return formatResponse({
      statusCode: HttpStatus.OK,
      message: `Location successfully created: ${name}`,
      data: newLocation,
    });
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('itemsPerPage') itemsPerPage: string = '10',
  ) {
    const allLocations = await this.locationService.findAll(
      parseInt(page),
      parseInt(itemsPerPage),
    );
    return formatResponse({
      statusCode: HttpStatus.FOUND,
      message: `Locations successfully fetched.`,
      data: allLocations,
    });
  }

  @Get(':name')
  async findOne(@Param('name') name: string) {
    const location = await this.locationService.findByName(name);
    if (!location) {
      throw new NotFoundException(`Location Not Found: ${name}`);
    }
    return location;
  }
}
