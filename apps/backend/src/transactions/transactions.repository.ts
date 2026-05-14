import { Injectable } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, data: CreateTransactionDto): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: {
        ...data,
        amount: data.amount,
        date: new Date(data.date),
        userId,
      },
    });
  }

  findAllByUser(
    userId: string,
    range?: { gte: Date; lt: Date },
    pagination?: { take?: number; skip?: number },
  ): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { userId, ...(range && { date: range }) },
      orderBy: { date: 'desc' },
      ...(pagination?.take !== undefined && { take: pagination.take }),
      ...(pagination?.skip !== undefined && { skip: pagination.skip }),
    });
  }

  findOne(id: string, userId: string): Promise<Transaction | null> {
    return this.prisma.transaction.findFirst({ where: { id, userId } });
  }

  async update(id: string, userId: string, data: UpdateTransactionDto): Promise<Transaction | null> {
    const existing = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) return null;
    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        ...(data.date && { date: new Date(data.date) }),
      },
    });
  }

  async remove(id: string, userId: string): Promise<Transaction | null> {
    const existing = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) return null;
    return this.prisma.transaction.delete({ where: { id } });
  }
}
