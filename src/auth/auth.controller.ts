import {
  Controller,
  Bind,
  Request,
  Post,
  UseGuards,
  Body,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Query,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { formatResponse } from 'src/utils/formatResponse';
import { LocalStrategy } from './strategies/local.strategy';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalStrategy)
  @Post('/login')
  @UsePipes(new ValidationPipe())
  @Bind(Request())
  async login(@Body() createAuthDto: CreateAuthDto) {
    const token = await this.authService.login(createAuthDto);
    return formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Successfully logged in',
      data: { token },
    });
  }

  @UseGuards(LocalStrategy)
  @Post('/loginAdmin')
  @UsePipes(new ValidationPipe())
  @Bind(Request())
  async loginAdmin(@Body() loginAdminDto: { password: string }) {
    const token = await this.authService.loginAdmin(loginAdminDto);
    return formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Successfully logged in',
      data: { token },
    });
  }

  @UseGuards(LocalStrategy)
  @Post('/loginSuperAdmin')
  @UsePipes(new ValidationPipe())
  @Bind(Request())
  async loginSuperAdmin(@Body() createAuthDto: CreateAuthDto) {
    const token = await this.authService.loginSuperAdmin(createAuthDto);
    return formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Successfully logged in',
      data: { token },
    });
  }

  @UseGuards(LocalStrategy)
  @Post('/addAdmin')
  @UsePipes(new ValidationPipe())
  @Bind(Request())
  async addNewAdmin(@Body() addNewAdminDTO: { id: string }) {
    const res = await this.authService.addNewAdmin(addNewAdminDTO);
    return formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Successfully added new admin',
      data: { res },
    });
  }

  @UseGuards(LocalStrategy)
  @Get('/checkAdmin')
  @UsePipes(new ValidationPipe())
  @Bind(Request())
  async checkAdmin(@Query('id') id: string) {
    const res = await this.authService.checkAdmin(id);
    return formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Successfully checked if card is valid.',
      data: { ...res },
    });
  }
}
