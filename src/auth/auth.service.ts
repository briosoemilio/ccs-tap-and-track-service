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
import { totp } from 'otplib';

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
    const isUserAdmin =
      user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN;
    const isCardKeyConsistent = createAuthDto?.cardKey === user?.cardKey;

    if (isUserAdmin && !isCardKeyConsistent && user?.cardKey !== '') {
      throw new UnauthorizedException('Account unauthorized.');
    }

    const payload: Payload = {
      name: user.name,
      uuid: user.uuid,
      yearSection: user?.yearSection || '',
      idNumber: user?.idNumber || '',
      email: user.email,
      role: user.role,
      cardKey: user?.cardKey || '',
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
    return token;
  }

  async loginAdmin(loginAdminDto: { password: string }) {
    const adminEmail = process.env.ADMIN_USER;

    const user = await this.validateUser(adminEmail, loginAdminDto.password);
    if (user?.role !== Role.ADMIN) {
      throw new UnauthorizedException('Account unauthorized.');
    }

    const payload: Payload = {
      name: user.name,
      uuid: user.uuid,
      yearSection: user?.yearSection || '',
      idNumber: user?.idNumber || '',
      email: user.email,
      role: user.role,
      cardKey: user?.cardKey || '',
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
    return token;
  }

  async loginSuperAdmin(loginAdminDto: { email: string; password: string }) {
    const user = await this.validateUser(
      loginAdminDto.email,
      loginAdminDto.password,
    );

    if (user?.role !== Role.SUPER_ADMIN) {
      throw new UnauthorizedException('Account unauthorized.');
    }

    const payload: Payload = {
      name: user.name,
      uuid: user.uuid,
      yearSection: user?.yearSection || '',
      idNumber: user?.idNumber || '',
      email: user.email,
      role: user.role,
      cardKey: user?.cardKey || '',
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

  async checkAdmin(id: string) {
    if (!id) {
      throw new BadRequestException('ID must not be empty.');
    }

    const adminEmail = process.env.ADMIN_USER;
    const user = await this.userService.findByEmail(adminEmail);
    if (!user) {
      throw new BadRequestException('Admin user not found.');
    }

    const currMetadata = JSON.parse(user?.metadata) || ({} as any);
    const currKeys = currMetadata?.keys || [];
    if (currKeys.includes(id)) {
      return { isAdmin: true, message: 'Admin found.' };
    } else {
      return { isAdmin: false, message: 'Admin not found.' };
    }
  }

  async createOTP(email: string, type: string) {
    // Find the user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(
        `User with email address not found: ${email}`,
      );
    }

    // Generate a new OTP
    const token = totp.generate(process.env.OTP_SECRET);

    // extract existing otp
    let { otp, ...rest } = JSON.parse(user.metadata);
    if (!Array.isArray(otp)) {
      otp = [];
    }
    const existingOtpIndex = otp.findIndex((item) => item.type === type);
    if (existingOtpIndex > -1) {
      otp[existingOtpIndex] = { code: token, type };
    } else {
      otp.push({ code: token, type });
    }
    const newMetadata = { ...rest, otp };

    // Update the user metadata in the database
    await this.userService.updateMetadata(user.id, JSON.stringify(newMetadata));

    // Return the generated OTP
    return token;
  }
}
