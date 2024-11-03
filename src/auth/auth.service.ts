import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Payload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email not found : ${email}`);
    }

    const isPassCorrect = await bcrypt.compare(password, user.password);
    if (!isPassCorrect) {
      throw new UnauthorizedException('Wrong password.');
    }

    return user;
  }

  async login(createAuthDto: CreateAuthDto) {
    const user = await this.validateUser(
      createAuthDto.email,
      createAuthDto.password,
    );
    const payload: Payload = {
      name: user.name,
      uuid: user.uuid,
      yearSection: user?.yearSection || '',
      idNumber: user?.idNumber || '',
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);
    return token;
  }
}
