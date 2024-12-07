import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto, reportedBy: number) {
    try {
      const data = { uuid: uuidv4(), ...createReportDto, reportedBy };
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

  async findByUser(reportedBy: number, page: number, itemsPerPage: number) {
    const skip = (page - 1) * itemsPerPage;
    const reports = await this.prisma.report.findMany({
      where: { reportedBy },
      skip: skip,
      take: itemsPerPage,
    });
    const totalReports = reports.length;
    return {
      data: reports || [],
      total: totalReports || 0,
      page,
      itemsPerPage,
    };
  }

  async generateSummary(startDate: string, endDate: string) {
    const reports = await this.prisma.report.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            categoryName: true,
            locationName: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            yearSection: true,
          },
        },
      },
    });

    const itemCountMap: Record<string, number> = {};
    const reportedByCountMap: Record<string, number> = {};
    const categoryCountMap: Record<string, number> = {};
    const locationCountMap: Record<string, number> = {};

    let mostReportedItemId = null;
    let maxReports = 0;

    let topReporterId = null;
    let maxReported = 0;

    let mostReportedCategory = '';
    let maxCategoryReports = 0;

    let mostReportedLocation = '';
    let maxLocationReports = 0;

    reports.forEach((report) => {
      const itemId = report.item.id;
      const userId = report.user.id;
      const categoryName = report.item.categoryName;
      const locationName = report.item.locationName;

      // Count occurrences of item reports
      itemCountMap[itemId] = (itemCountMap[itemId] || 0) + 1;

      // Count occurrences of user reports
      reportedByCountMap[userId] = (reportedByCountMap[userId] || 0) + 1;

      // Count occurrences of category reports, including SYSTEM_UNIT
      categoryCountMap[categoryName] =
        (categoryCountMap[categoryName] || 0) + 1;

      // Count occurrences of location reports
      locationCountMap[locationName] =
        (locationCountMap[locationName] || 0) + 1;
    });

    // Finding the most reported item
    for (const [itemId, count] of Object.entries(itemCountMap)) {
      if (count > maxReports) {
        maxReports = count;
        mostReportedItemId = itemId;
      }
    }

    // Finding the top reporter
    for (const [userId, count] of Object.entries(reportedByCountMap)) {
      if (count > maxReported) {
        maxReported = count;
        topReporterId = userId;
      }
    }

    // Finding the most reported category, including SYSTEM_UNIT
    for (const [categoryName, count] of Object.entries(categoryCountMap)) {
      if (count > maxCategoryReports) {
        maxCategoryReports = count;
        mostReportedCategory = categoryName;
      }
    }

    // Finding the most reported location
    for (const [locationName, count] of Object.entries(locationCountMap)) {
      if (count > maxLocationReports) {
        maxLocationReports = count;
        mostReportedLocation = locationName;
      }
    }

    // Fetch additional details about the most reported item and top reporter
    const mostReportedItem = mostReportedItemId
      ? await this.prisma.item.findUnique({
          where: { id: parseInt(mostReportedItemId) },
        })
      : null;

    const topReporter = topReporterId
      ? await this.prisma.user.findUnique({
          where: { id: parseInt(topReporterId) },
        })
      : null;

    return {
      reportsGenerated: reports.length,
      reportStart: startDate,
      reportEnd: endDate,
      mostReportedItem: {
        item: {
          name: mostReportedItem?.name || '',
          category: mostReportedItem?.categoryName || '',
          location: mostReportedItem?.locationName || '',
        },
        count: maxReports,
      },
      topReporter: {
        user: {
          name: topReporter?.name || '',
          email: topReporter?.email || '',
          yearSection: topReporter?.yearSection || '',
        },
        count: maxReported,
      },
      categoryReportCounts: categoryCountMap,
      locationWithMostReports: {
        locationName: mostReportedLocation,
        count: maxLocationReports,
      },
    };
  }
}
