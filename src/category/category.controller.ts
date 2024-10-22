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
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const name = createCategoryDto.name;
    const category = await this.categoryService.findOne(name);
    if (category) {
      throw new ConflictException(`Category already exists: ${name}`);
    }
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':name')
  async findOne(@Param('name') name: string) {
    const category = await this.categoryService.findOne(name);
    if (!category) {
      throw new NotFoundException(`Category Not Found: ${name}`);
    }
    return category;
  }
}
