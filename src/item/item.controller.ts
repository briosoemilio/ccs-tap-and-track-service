import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpStatus,
  ConflictException,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import {
  ChangeItemLocationDto,
  ChangeItemStatusDto,
} from './dto/update-item.dto';
import { formatResponse } from 'src/utils/formatResponse';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createItemDto: CreateItemDto) {
    // Check Name
    const checkName = await this.itemService.findByName(createItemDto.name);
    if (!!checkName) {
      throw new ConflictException(
        `Item with name already exists : ${createItemDto.name}`,
      );
    }

    // Create Item
    const item = await this.itemService.create(createItemDto);
    return formatResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Item created successfully',
      data: item,
    });
  }

  @Get()
  async findAll() {
    const items = await this.itemService.findAll();
    return formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Items fetched successfully',
      data: items,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.itemService.findByID(parseInt(id));
    if (!item) {
      throw new NotFoundException(`Item not found : ${id}`);
    }

    return formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Item fetched successfully',
      data: item,
    });
  }

  @Get('category/:categoryName')
  async findByCategory(@Param('categoryName') categoryName: string) {
    const items = await this.itemService.findByCategory(categoryName);
    if (!items || items.length === 0) {
      throw new NotFoundException(
        `No items found for category name: ${categoryName}`,
      );
    }
    return formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Items fetched successfully',
      data: items,
    });
  }

  @Patch('/status/:id')
  @UsePipes(new ValidationPipe())
  async updateStatus(
    @Param('id') id: string,
    @Body() updateItemDto: ChangeItemStatusDto,
  ) {
    const newItem = await this.itemService.updateItemStatus(
      parseInt(id),
      updateItemDto.status,
    );
    return formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Item changed status successfully',
      data: newItem,
    });
  }

  @Patch('/location/:id')
  @UsePipes(new ValidationPipe())
  async updateLocation(
    @Param('id') id: string,
    @Body() updateItemDto: ChangeItemLocationDto,
  ) {
    const newItem = await this.itemService.updateItemLocation(
      parseInt(id),
      updateItemDto.locationName,
    );
    return formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Item changed status successfully',
      data: newItem,
    });
  }
}
