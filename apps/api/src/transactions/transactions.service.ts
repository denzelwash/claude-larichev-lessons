import { Injectable, NotFoundException } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { CategoriesRepository } from '../categories/categories.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly repository: TransactionsRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async create(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
    const category = await this.categoriesRepository.findOne(dto.categoryId, userId);
    if (!category) throw new NotFoundException('Category not found');
    return this.repository.create(userId, dto);
  }

  findAll(userId: string, query: QueryTransactionsDto): Promise<Transaction[]> {
    let range: { gte: Date; lt: Date } | undefined;
    if (query.month !== undefined && query.year !== undefined) {
      range = {
        gte: new Date(query.year, query.month - 1, 1),
        lt: new Date(query.year, query.month, 1),
      };
    }
    return this.repository.findAllByUser(userId, range);
  }

  async findOne(userId: string, id: string): Promise<Transaction> {
    const transaction = await this.repository.findOne(id, userId);
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto): Promise<Transaction> {
    if (dto.categoryId) {
      const category = await this.categoriesRepository.findOne(dto.categoryId, userId);
      if (!category) throw new NotFoundException('Category not found');
    }
    const transaction = await this.repository.update(id, userId, dto);
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async remove(userId: string, id: string): Promise<Transaction> {
    const transaction = await this.repository.remove(id, userId);
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }
}
