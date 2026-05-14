import { Injectable } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

/** Прямой доступ к таблице транзакций через Prisma. */
@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создаёт новую транзакцию для указанного пользователя.
   *
   * @param userId - Идентификатор владельца транзакции.
   * @param data - Данные новой транзакции.
   * @returns Созданная транзакция.
   */
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

  /**
   * Возвращает все транзакции пользователя с опциональной фильтрацией по периоду и пагинацией.
   *
   * @param userId - Идентификатор пользователя.
   * @param range - Диапазон дат (`gte` — начало, `lt` — конец периода). Если не задан, возвращаются все транзакции.
   * @param pagination - Параметры пагинации: `take` — лимит записей, `skip` — смещение.
   * @returns Массив транзакций, отсортированных по дате убывания.
   */
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

  /**
   * Находит одну транзакцию по её идентификатору с проверкой владельца.
   *
   * @param id - Идентификатор транзакции.
   * @param userId - Идентификатор пользователя — гарантирует, что транзакция принадлежит ему.
   * @returns Транзакция или `null`, если не найдена.
   */
  findOne(id: string, userId: string): Promise<Transaction | null> {
    return this.prisma.transaction.findFirst({ where: { id, userId } });
  }

  /**
   * Обновляет транзакцию, если она принадлежит указанному пользователю.
   *
   * @param id - Идентификатор транзакции.
   * @param userId - Идентификатор пользователя — гарантирует владение.
   * @param data - Поля для обновления (все необязательны).
   * @returns Обновлённая транзакция или `null`, если транзакция не найдена.
   */
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

  /**
   * Удаляет транзакцию, если она принадлежит указанному пользователю.
   *
   * @param id - Идентификатор транзакции.
   * @param userId - Идентификатор пользователя — гарантирует владение.
   * @returns Удалённая транзакция или `null`, если транзакция не найдена.
   */
  async remove(id: string, userId: string): Promise<Transaction | null> {
    const existing = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) return null;
    return this.prisma.transaction.delete({ where: { id } });
  }
}
