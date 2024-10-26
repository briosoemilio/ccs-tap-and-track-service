import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto) {
    try {
      const data = { uuid: uuidv4(), ...createReportDto };
      const report = await this.prisma.report.create({ data });
      return report;
    } catch (err) {
      throw new InternalServerErrorException(
        `An error has occurred creating report : ${JSON.stringify(err)}`,
      );
    }
  }

  async findAll(page: number, itemsPerPage: number) {
    const skip = (page - 1) * itemsPerPage;
    const reports = await this.prisma.report.findMany({
      skip: skip,
      take: itemsPerPage,
    });
    const totalReports = await this.prisma.report.count();
    return {
      data: reports || [],
      total: totalReports || 0,
      page,
      itemsPerPage,
    };
  }
}
