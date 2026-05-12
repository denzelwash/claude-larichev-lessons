import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsRepository } from './transactions.repository';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [CategoriesModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository],
})
export class TransactionsModule {}
