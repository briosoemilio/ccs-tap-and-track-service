import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
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
    if (user?.role === Role.ADMIN) {
      throw new UnauthorizedException('Account unauthorized.');
    }
    const payload: Payload = {
      name: user.name,
      uuid: user.uuid,
      yearSection: user?.yearSection || '',
      idNumber: user?.idNumber || '',
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
    return token;
  }

  async loginAdmin(loginAdminDto: { password: string }) {
    const adminEmail = process.env.ADMIN_USER;

    const user = await this.validateUser(adminEmail, loginAdminDto.password);

    const payload: Payload = {
      name: user.name,
      uuid: user.uuid,
      yearSection: user?.yearSection || '',
      idNumber: user?.idNumber || '',
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
    return token;
  }

  async addNewAdmin(addNewAdminDTO: { id: string }) {
    const { id } = addNewAdminDTO;

    if (!id) {
      throw new BadRequestException('ID must not be empty.');
    }

    const adminEmail = process.env.ADMIN_USER;
    const user = await this.userService.findByEmail(adminEmail);

    if (!user) {
      throw new BadRequestException('Admin user not found.');
    }

    const newKey = id;
    const currMetadata = JSON.parse(user?.metadata) || ({} as any);

    const currKeys = currMetadata?.keys || [];
    if (currKeys.includes(newKey)) {
      throw new BadRequestException('This key is already added.');
    }

    const updatedKeys = [...currKeys, newKey];
    const updatedMetadata = { ...currMetadata, keys: updatedKeys };

    // update user metadata
    await this.userService.updateMetadata(
      user?.id,
      JSON.stringify(updatedMetadata),
    );

    return { message: 'Admin key added successfully.' };
  }
}
