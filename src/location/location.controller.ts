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
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';

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
    return this.locationService.create(createLocationDto);
  }

  @Get()
  findAll() {
    return this.locationService.findAll();
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
