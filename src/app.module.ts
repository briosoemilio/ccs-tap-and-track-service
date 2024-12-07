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
import { MailerModule } from '@nestjs-modules/mailer';

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
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: 'No Reply: <ccs-tap-and-track-no-reply@mail.com>',
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
