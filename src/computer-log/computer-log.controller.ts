import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ComputerLogService } from './computer-log.service';
import { CreateComputerLogDto } from './dto/create-computer-log.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { formatResponse } from 'src/utils/formatResponse';
import { ComputerLogValidator } from './validators/computer-log-validator';
import { ComputerService } from 'src/computer/computer.service';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('computer-logs')
export class ComputerLogController {
  private computerLogValidator: ComputerLogValidator;
  constructor(
    private readonly prisma: PrismaService,
    private readonly computerLogService: ComputerLogService,
    private readonly computerService: ComputerService,
    private readonly userService: UserService,
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
  async create(@Body() createComputerLogDto: CreateComputerLogDto) {
    const { userId, computerId } = createComputerLogDto;

    return await this.prisma.$transaction(async () => {
      // validate user
      await this.computerLogValidator.validateUser(userId);

      // validate computer
      await this.computerLogValidator.validateComputer(computerId);

      // create log
      const newLog = await this.computerLogService.create(createComputerLogDto);

      // update computer logs
      await this.computerLogValidator.updateLatestLog(computerId, newLog.uuid);
      return formatResponse({
        statusCode: HttpStatus.CREATED,
        message: `Log successfully created : ${newLog.uuid}`,
        data: newLog,
      });
    });
  }

  @Patch('/end-log/:id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async endComputerLog(@Param('id') id: string) {
    const updatedComputerLog = await this.computerLogService.endComputerLog(
      parseInt(id),
    );
    return formatResponse({
      statusCode: HttpStatus.OK,
      message: `Log successfully ended:  ${updatedComputerLog.uuid}`,
      data: updatedComputerLog,
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
