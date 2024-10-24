import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { LocationModule } from './location/location.module';
import { ItemModule } from './item/item.module';
import { ComputerModule } from './computer/computer.module';

@Module({
  imports: [CategoryModule, LocationModule, ItemModule, ComputerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
