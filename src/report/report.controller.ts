import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { formatResponse } from 'src/utils/formatResponse';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReportValidator } from './validators/report-validator';
import { ItemService } from 'src/item/item.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Controller('report')
export class ReportController {
  private reportValidator: ReportValidator;
  constructor(
    private readonly reportService: ReportService,
    private readonly itemService: ItemService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    this.reportValidator = new ReportValidator(
      this.itemService,
      this.userService,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async create(@Body() createReportDto: CreateReportDto, @Request() req) {
    const { itemId } = createReportDto;

    // decode token
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const decodedToken = await this.jwtService.decode(bearerToken);

    // get user
    const user = await this.userService.findByUUID(decodedToken?.uuid);

    // Validate Item Id
    await this.reportValidator.validateItem(itemId);

    // Validate User Id
    await this.reportValidator.validateUser(user?.id);

    // Create Report
    const report = await this.reportService.create(createReportDto, user?.id);
    return formatResponse({
      statusCode: HttpStatus.CREATED,
      message: `Report successfully filed by user id : ${user?.id} | item id: ${itemId}`,
      data: report,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('page') page: string = '1',
    @Query('itemsPerPage') itemsPerPage: string = '10',
  ) {
    const reports = await this.reportService.findAll(
      parseInt(page),
      parseInt(itemsPerPage),
    );
    return formatResponse({
      statusCode: HttpStatus.FOUND,
      message: 'Reports list successfully fetched',
      data: reports,
    });
  }

  @Get('user-reports')
  @UseGuards(JwtAuthGuard)
  async getByUserId(
    @Query('page') page: string = '1',
    @Query('itemsPerPage') itemsPerPage: string = '10',
    @Request() req,
    @Query('userID') userID?: string,
  ) {
    let _userId: number;

    if (userID) {
      _userId = parseInt(userID); // if userID was passed in body
    } else {
      // else decode token

      const bearerToken = req.headers.authorization?.split(' ')[1];
      const decodedToken = await this.jwtService.decode(bearerToken);

      // get user
      const user = await this.userService.findByUUID(decodedToken?.uuid);

      _userId = user?.id;
    }

    // get reports
    const reports = await this.reportService.findByUser(
      _userId,
      parseInt(page),
      parseInt(itemsPerPage),
    );

    return formatResponse({
      statusCode: HttpStatus.FOUND,
      message: 'Reports list successfully fetched',
      data: reports,
    });
  }

  @Get('report-summary')
  async getReportSummary(
    @Query('startDate') startDate: string = '1',
    @Query('endDate') endDate: string = '10',
  ) {
    const summary = await this.reportService.generateSummary(
      startDate,
      endDate,
    );

    return formatResponse({
      statusCode: HttpStatus.FOUND,
      message: 'Report summary successfully generated:',
      data: summary,
    });
  }
}
