import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './categories.repository';

@Module({
  imports: [CqrsModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository],
  exports: [CategoriesRepository],
})
export class CategoriesModule {}
