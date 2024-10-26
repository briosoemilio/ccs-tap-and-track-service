import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ConflictException,
  NotFoundException,
  UsePipes,
  ValidationPipe,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { formatResponse } from 'src/utils/formatResponse';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const name = createCategoryDto.name;
    const category = await this.categoryService.findByName(name);
    if (category) {
      throw new ConflictException(`Category already exists: ${name}`);
    }
    return formatResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Category successfully created.',
      data: category,
    });
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('itemsPerPage') itemsPerPage: string = '10',
  ) {
    const categories = await this.categoryService.findAll(
      parseInt(page),
      parseInt(itemsPerPage),
    );
    return formatResponse({
      statusCode: HttpStatus.FOUND,
      message: 'Category list successfully fetched',
      data: categories,
    });
  }

  @Get(':name')
  async findByName(@Param('name') name: string) {
    const category = await this.categoryService.findByName(name);
    if (!category) {
      throw new NotFoundException(`Category Not Found: ${name}`);
    }
    return formatResponse({
      statusCode: HttpStatus.FOUND,
      message: `Category successfully fetched : ${name}`,
      data: category,
    });
  }
}
