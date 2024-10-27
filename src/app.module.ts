import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { LocationModule } from './location/location.module';
import { ItemModule } from './item/item.module';
import { ComputerModule } from './computer/computer.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ReportModule } from './report/report.module';
import { ComputerLogModule } from './computer-log/computer-log.module';

@Module({
  imports: [
    CategoryModule,
    LocationModule,
    ItemModule,
    ComputerModule,
    UserModule,
    AuthModule,
    ReportModule,
    ComputerLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
