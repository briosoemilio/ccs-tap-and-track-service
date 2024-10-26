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
}
