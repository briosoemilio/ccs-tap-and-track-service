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
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { formatResponse } from 'src/utils/formatResponse';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReportValidator } from './validators/report-validator';
import { ItemService } from 'src/item/item.service';
import { UserService } from 'src/user/user.service';

@Controller('report')
export class ReportController {
  private reportValidator: ReportValidator;
  constructor(
    private readonly reportService: ReportService,
    private readonly itemService: ItemService,
    private readonly userService: UserService,
  ) {
    this.reportValidator = new ReportValidator(
      this.itemService,
      this.userService,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async create(@Body() createReportDto: CreateReportDto) {
    const { itemId, reportedBy } = createReportDto;

    // Validate Item Id
    await this.reportValidator.validateItem(itemId);

    // Validate User Id
    await this.reportValidator.validateUser(reportedBy);

    // Create Report
    const report = await this.reportService.create(createReportDto);
    return formatResponse({
      statusCode: HttpStatus.CREATED,
      message: `Report successfully filed by user id : ${reportedBy} | item id: ${itemId}`,
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
}
