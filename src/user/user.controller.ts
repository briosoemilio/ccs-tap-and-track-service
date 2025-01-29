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
import { MailerService } from '@nestjs-modules/mailer';
import { AuthService } from 'src/auth/auth.service';
import { generate } from 'generate-password';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService,
    private readonly authService: AuthService,
  ) {}

  @Post('/register')
  @UsePipes(new ValidationPipe())
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.prisma.$transaction(async () => {
        const { email, password } = createUserDto;
        const _password = password || generate({ length: 10, numbers: true });
        const metadata = password
          ? '{}'
          : JSON.stringify({ firstPw: _password });
        const dto = { password: _password, metadata, ...createUserDto };

        const user = await this.userService.create(dto);

        const emailPw = async () => {
          if (password) return;
          const message = `Congratulations! You are now officially enrolled and part of Eulogio 'Amang' Rodriguez Institute of Science and Technology or EARIST Community. \n\n 
          
          Your CCS Tap And Track Login Credentials\n 
          username: ${email}\n
          password: ${_password} \n\n
          
          NOTE: Once inside the app, don't forget to change your password immediately and complete NFC flow.`;

          await this.mailService.sendMail({
            to: email,
            subject: `CCS Tap And Track: NEW ACCOUNT`,
            text: message,
          });
        };
        await emailPw();

        return formatResponse({
          statusCode: HttpStatus.CREATED,
          message: 'User successfully registered',
          data: user,
        });
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
  async findById(
    @Param('identifier') identifier: string,
    @Query('page') page: string = '1',
    @Query('itemsPerPage') itemsPerPage: string = '10',
  ) {
    // Check if the identifier matches a Role enum value
    if (Object.values(Role).includes(identifier as Role)) {
      const users = await this.userService.findByRole(
        identifier as Role,
        parseInt(page, 10),
        parseInt(itemsPerPage, 10),
      );

      return formatResponse({
        statusCode: HttpStatus.FOUND,
        message: `Users with role: ${identifier} successfully fetched`,
        data: users,
      });
    }

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

  @Patch('/otp/forgot-password')
  async sendOtpForgotPassword(@Body() request: { email: string }) {
    const { email } = request;

    const OTP = await this.authService.createOTP(email, 'FORGOT_PASSWORD');

    const message = `We received a request to reset the password for your account on CCS Tap And Track. To ensure your security, please use the One-Time Password (OTP) below to reset your password:\n\n**Your OTP: ${OTP} **\n\nPlease note:\n- The OTP is valid for the next 10 minutes.\n- If you did not request a password reset, please ignore this email or contact our support team for assistance.`;

    await this.mailService.sendMail({
      to: email,
      subject: `CCS Tap And Track: FORGOT PASSWORD`,
      text: message,
    });

    return formatResponse({
      statusCode: HttpStatus.OK,
      message: `Successfully sent OTP: ${email}`,
      data: {
        email,
        otp: OTP,
      },
    });
  }

  @Patch('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: { email: string; newPassword: string },
  ) {
    const { email, newPassword } = resetPasswordDto;

    // get user
    const user = await this.userService.findByEmail(email);

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

  @Patch('update-user/:identifier')
  async updateUser(
    @Param('identifier') identifier: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.findByIdentifier(identifier);

    const updatedUser = await this.userService.updateUser(
      user?.id,
      updateUserDto,
    );

    return formatResponse({
      statusCode: HttpStatus.OK,
      message: `User successfully updated: ${user?.uuid}`,
      data: updatedUser,
    });
  }

  @Patch('override-password/:identifier')
  async overridePassword(
    @Param('identifier') identifier: string,
    @Body() overridePasswordDto: { password: string; confirmPassword: string },
    @Request() req,
  ) {
    // check if super admin
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const decodedToken = await this.jwtService.decode(bearerToken);
    const role = decodedToken?.role;
    if (role !== Role.SUPER_ADMIN) {
      throw new BadRequestException(
        'Unauthorized. Override is only available to SUPER ADMIN accounts',
      );
    }

    // Check password:
    const { password, confirmPassword } = overridePasswordDto;
    if (password !== confirmPassword) {
      throw new BadRequestException('Password must be the same.');
    }

    const adminUser = await this.userService.findByIdentifier(identifier);
    const updatedUser = await this.userService.updatePassword(
      adminUser?.id,
      password,
    );

    return formatResponse({
      statusCode: HttpStatus.OK,
      message: `Successfully changed user password: ${adminUser?.uuid}`,
      data: updatedUser,
    });
  }

  @Patch('archive-account/:identifier')
  async archiveAccount(
    @Param('identifier') identifier: string,
    @Request() req,
  ) {
    // check if admin
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const decodedToken = await this.jwtService.decode(bearerToken);
    const role = decodedToken?.role;
    if (![Role.ADMIN, Role.SUPER_ADMIN].includes(role)) {
      throw new BadRequestException(
        'Unauthorized. Override is only available to ADMIN accounts',
      );
    }

    const user = await this.userService.findByIdentifier(identifier);
    const updatedUser = await this.userService.archiveUser(user?.id);

    return formatResponse({
      statusCode: HttpStatus.OK,
      message: `Successfully archived user: ${updatedUser?.uuid}`,
      data: updatedUser,
    });
  }

  @Patch('unarchive-account/:identifier')
  async unarchiveAccount(
    @Param('identifier') identifier: string,
    @Request() req,
  ) {
    // check if admin
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const decodedToken = await this.jwtService.decode(bearerToken);
    const role = decodedToken?.role;
    if (![Role.ADMIN, Role.SUPER_ADMIN].includes(role)) {
      throw new BadRequestException(
        'Unauthorized. Override is only available to ADMIN accounts',
      );
    }

    const user = await this.userService.findByIdentifier(identifier);
    const updatedUser = await this.userService.unarchiveUser(user?.id);

    return formatResponse({
      statusCode: HttpStatus.OK,
      message: `Successfully unarchived user: ${updatedUser?.uuid}`,
      data: updatedUser,
    });
  }
}
