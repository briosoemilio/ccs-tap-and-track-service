import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { LocationModule } from './location/location.module';
import { ItemModule } from './item/item.module';

@Module({
  imports: [CategoryModule, LocationModule, ItemModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
