import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpStatus,
  Query,
  InternalServerErrorException,
  ValidationPipe,
  UsePipes,
  NotFoundException,
  Request,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ChangeSectionDto, CreateUserDto } from './dto/create-user.dto';
import { formatResponse } from 'src/utils/formatResponse';
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

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
    const user = await this.userService.findByIdentifier(identifier);
    if (!user) throw new NotFoundException(`User ID not found: ${identifier}`);

    return formatResponse({
      statusCode: HttpStatus.FOUND,
      message: `User successfully fetched: ${identifier}`,
      data: user,
    });
  }

  @Patch('/change-section')
  async changeSection(@Body() createUserDto: ChangeSectionDto, @Request() req) {
    // decode token
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const decodedToken = await this.jwtService.decode(bearerToken);

    // get user
    const user = await this.userService.findByUUID(decodedToken?.uuid);

    // extract new section
    const { section: newSection } = createUserDto;

    // update section
    const newUser = await this.userService.updateSection(user?.id, newSection);

    return formatResponse({
      statusCode: HttpStatus.OK,
      message: `User successfully updated: ${user?.uuid}`,
      data: newUser,
    });
  }

  @Patch('change-password')
  async changePassword(
    @Body() changePasswordDto: { oldPassword: string; newPassword: string },
    @Request() req,
  ) {
    // decode token
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const decodedToken = await this.jwtService.decode(bearerToken);

    // get user
    const user = await this.userService.findByUUID(decodedToken?.uuid);

    // extract
    const { oldPassword, newPassword } = changePasswordDto;
    if (oldPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from old password.',
      );
    }

    // validate old password
    const isPassCorrect = await bcrypt.compare(oldPassword, user.password);

    if (!isPassCorrect) {
      throw new UnauthorizedException('Wrong password');
    }

    // update password
    const newUser = await this.userService.updatePassword(
      user?.id,
      newPassword,
    );

    return formatResponse({
      statusCode: HttpStatus.OK,
      message: `User successfully updated: ${user?.uuid}`,
      data: newUser,
    });
  }
}
