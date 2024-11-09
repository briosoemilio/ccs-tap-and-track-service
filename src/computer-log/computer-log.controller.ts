import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  Query,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { ComputerLogService } from './computer-log.service';
import { CreateComputerLogDto } from './dto/create-computer-log.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { formatResponse } from 'src/utils/formatResponse';
import { ComputerLogValidator } from './validators/computer-log-validator';
import { ComputerService } from 'src/computer/computer.service';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Controller('computer-logs')
export class ComputerLogController {
  private computerLogValidator: ComputerLogValidator;
  constructor(
    private readonly prisma: PrismaService,
    private readonly computerLogService: ComputerLogService,
    private readonly computerService: ComputerService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    this.computerLogValidator = new ComputerLogValidator(
      this.computerService,
      this.userService,
      this.computerLogService,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createComputerLogDto: CreateComputerLogDto,
    @Request() req,
  ) {
    const { computerId } = createComputerLogDto;

    // decode token
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const decodedToken = await this.jwtService.decode(bearerToken);

    // get user
    const user = await this.userService.findByUUID(decodedToken?.uuid);

    return await this.prisma.$transaction(async () => {
      // validate user
      await this.computerLogValidator.validateUser(user.id);

      // validate computer
      await this.computerLogValidator.validateComputer(computerId);

      // create log
      const newLog = await this.computerLogService.create(user.id, computerId);

      // update computer logs
      await this.computerLogValidator.updateLatestLog(computerId, newLog.uuid);
      return formatResponse({
        statusCode: HttpStatus.CREATED,
        message: `Log successfully created : ${newLog.uuid}`,
        data: newLog,
      });
    });
  }

  @Patch('/end-log/:identifier')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async endComputerLog(
    @Param('identifier') identifier: string,
    @Request() req,
  ) {
    // decode token
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const decodedToken = await this.jwtService.decode(bearerToken);

    // get user
    const user = await this.userService.findByUUID(decodedToken?.uuid);

    // validate computer log
    const computerLog =
      await this.computerLogService.findByIdentifier(identifier);
    if (!computerLog)
      throw new NotFoundException(`Computer Log not found : ${identifier}.`);

    // update computer log
    const updatedComputerLog = await this.computerLogService.endComputerLog(
      computerLog.id,
      user?.id,
    );
    return formatResponse({
      statusCode: HttpStatus.OK,
      message: `Log successfully ended:  ${updatedComputerLog.uuid}`,
      data: updatedComputerLog,
    });
  }

  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string) {
    const computerLog =
      await this.computerLogService.findByIdentifier(identifier);
    if (!computerLog)
      throw new NotFoundException(`Computer not found : ${identifier}.`);

    const user = await this.userService.findById(computerLog.userId);
    const computer = await this.computerService.findById(
      computerLog.computerId,
    );

    const data = {
      ...computerLog,
      user,
      computer,
    };
    delete data.userId;
    delete data.computerId;

    return formatResponse({
      statusCode: HttpStatus.FOUND,
      message: `Computer log fetched with identifier : ${identifier}`,
      data,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async findAll(
    @Query('page') page: string = '1',
    @Query('itemsPerPage') itemsPerPage: string = '10',
  ) {
    const computerLogs = await this.computerLogService.findAll(
      parseInt(page),
      parseInt(itemsPerPage),
    );
    return formatResponse({
      statusCode: HttpStatus.FOUND,
      message: 'Computer Logs list successfully fetched',
      data: computerLogs,
    });
  }
}
