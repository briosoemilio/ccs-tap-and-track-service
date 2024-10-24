import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ComputerService } from './computer.service';
import { CreateComputerDto } from './dto/create-computer.dto';
import { UpdateComputerDto } from './dto/update-computer.dto';
import { ComputerValidator } from './validators/computer-validator';
import { formatResponse } from 'src/utils/formatResponse';
import { ItemService } from 'src/item/item.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationService } from 'src/location/location.service';

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
  async create(@Body() createComputerDto: CreateComputerDto) {
    try {
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
        const newComputer =
          await this.computerService.create(createComputerDto);

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
    } catch (err) {
      console.log('Error creating computer : ', err);
      throw err;
    }
  }

  @Get()
  findAll() {
    return this.computerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.computerService.findById(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateComputerDto: UpdateComputerDto,
  ) {
    return this.computerService.update(+id, updateComputerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.computerService.remove(+id);
  }
}
