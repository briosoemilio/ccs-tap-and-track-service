import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  findAll() {
    return this.locationService.findAll();
  }

  @Get(':name')
  async findOne(@Param('name') name: string) {
    const location = await this.locationService.findOne(name);
    if (!location) {
      throw new NotFoundException(`Category Not Found: ${name}`);
    }
    return location;
  }
}
