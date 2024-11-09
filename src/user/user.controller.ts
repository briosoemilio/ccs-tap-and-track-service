import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
  InternalServerErrorException,
  ValidationPipe,
  UsePipes,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { formatResponse } from 'src/utils/formatResponse';
import { Role } from '@prisma/client';
import { isIntegerString } from 'src/utils/isInteger';
import { isIdentifierUUID } from 'src/utils/isIdentifierUUID';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  @UsePipes(new ValidationPipe())
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      return formatResponse({
        statusCode: HttpStatus.CREATED,
        message: 'User successfully registered',
        data: user,
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `An error occurred : ${JSON.stringify(err)}`,
      );
    }
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('itemsPerPage') itemsPerPage: string = '10',
    @Body() body?: { role: Role },
  ) {
    const role = body?.role;
    let users;
    if (role) {
      const usersByRole = await this.userService.findByRole(
        role,
        parseInt(page),
        parseInt(itemsPerPage),
      );
      users = usersByRole;
    } else {
      const allUsers = await this.userService.findAll(
        parseInt(page),
        parseInt(itemsPerPage),
      );
      users = allUsers;
    }

    return formatResponse({
      statusCode: HttpStatus.FOUND,
      message: 'Users list successfully fetched',
      data: users,
    });
  }

  @Get(':identifier')
  async findById(@Param('identifier') identifier: string) {
    const user = await this.findByIdentifier(identifier);
    if (!user) throw new NotFoundException(`User ID not found: ${identifier}`);

    return formatResponse({
      statusCode: HttpStatus.FOUND,
      message: `User successfully fetched: ${identifier}`,
      data: user,
    });
  }

  private async findByIdentifier(identifier: string) {
    // if identifier is id
    if (isIntegerString(identifier)) {
      return await this.userService.findById(parseInt(identifier));
    }

    // if identifier is uuid
    if (isIdentifierUUID(identifier)) {
      return await this.userService.findByUUID(identifier);
    }

    // if identifier is id number
    return await this.userService.findByIdNumber(identifier);
  }
}
