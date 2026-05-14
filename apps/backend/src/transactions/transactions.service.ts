import { Injectable, NotFoundException } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { CategoriesRepository } from '../categories/categories.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsRepository } from './transactions.repository';

/** Бизнес-логика управления транзакциями. */
@Injectable()
export class TransactionsService {
  constructor(
    private readonly repository: TransactionsRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  /**
   * Создаёт транзакцию после проверки, что указанная категория принадлежит пользователю.
   *
   * @param userId - Идентификатор аутентифицированного пользователя.
   * @param dto - Данные новой транзакции.
   * @returns Созданная транзакция.
   * @throws {NotFoundException} Если категория с `dto.categoryId` не найдена у этого пользователя.
   */
  async create(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
    const category = await this.categoriesRepository.findOne(dto.categoryId, userId);
    if (!category) throw new NotFoundException('Category not found');
    return this.repository.create(userId, dto);
  }

  /**
   * Возвращает список транзакций пользователя с опциональной фильтрацией по месяцу/году и пагинацией.
   * Если `month` и `year` заданы одновременно, возвращаются только транзакции за этот календарный месяц.
   *
   * @param userId - Идентификатор аутентифицированного пользователя.
   * @param query - Параметры фильтрации и пагинации.
   * @returns Массив транзакций, отсортированных по дате убывания.
   */
  findAll(userId: string, query: QueryTransactionsDto): Promise<Transaction[]> {
    let range: { gte: Date; lt: Date } | undefined;
    if (query.month !== undefined && query.year !== undefined) {
      range = {
        gte: new Date(query.year, query.month - 1, 1),
        lt: new Date(query.year, query.month, 1),
      };
    }
    const pagination = {
      take: query.limit,
      skip: query.offset,
    };
    return this.repository.findAllByUser(userId, range, pagination);
  }

  /**
   * Возвращает одну транзакцию по идентификатору, убеждаясь, что она принадлежит пользователю.
   *
   * @param userId - Идентификатор аутентифицированного пользователя.
   * @param id - Идентификатор транзакции.
   * @returns Найденная транзакция.
   * @throws {NotFoundException} Если транзакция не найдена или не принадлежит пользователю.
   */
  async findOne(userId: string, id: string): Promise<Transaction> {
    const transaction = await this.repository.findOne(id, userId);
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  /**
   * Обновляет поля транзакции. Если передаётся новый `categoryId`, проверяет, что категория принадлежит пользователю.
   *
   * @param userId - Идентификатор аутентифицированного пользователя.
   * @param id - Идентификатор обновляемой транзакции.
   * @param dto - Поля для обновления (все необязательны).
   * @returns Обновлённая транзакция.
   * @throws {NotFoundException} Если новая категория не найдена у пользователя.
   * @throws {NotFoundException} Если транзакция не найдена или не принадлежит пользователю.
   */
  async update(userId: string, id: string, dto: UpdateTransactionDto): Promise<Transaction> {
    if (dto.categoryId) {
      const category = await this.categoriesRepository.findOne(dto.categoryId, userId);
      if (!category) throw new NotFoundException('Category not found');
    }
    const transaction = await this.repository.update(id, userId, dto);
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  /**
   * Удаляет транзакцию, убеждаясь, что она принадлежит пользователю.
   *
   * @param userId - Идентификатор аутентифицированного пользователя.
   * @param id - Идентификатор удаляемой транзакции.
   * @returns Удалённая транзакция.
   * @throws {NotFoundException} Если транзакция не найдена или не принадлежит пользователю.
   */
  async remove(userId: string, id: string): Promise<Transaction> {
    const transaction = await this.repository.remove(id, userId);
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }
}
