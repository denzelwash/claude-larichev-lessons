import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicUser } from '@app/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

/**
 * REST-контроллер для управления транзакциями текущего пользователя.
 * Все маршруты защищены `JwtAuthGuard`.
 */
@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Создаёт новую транзакцию для аутентифицированного пользователя.
   *
   * @param user - Данные текущего пользователя из JWT.
   * @param dto - Тело запроса с данными транзакции.
   * @returns Созданная транзакция.
   */
  @Post()
  @ApiOperation({ summary: 'Создать транзакцию' })
  @ApiResponse({ status: 201, description: 'Транзакция создана.' })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  @ApiResponse({ status: 404, description: 'Категория не найдена.' })
  create(@CurrentUser() user: PublicUser, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user.id, dto);
  }

  /**
   * Возвращает список транзакций текущего пользователя.
   * Поддерживает фильтрацию по месяцу/году и пагинацию через query-параметры.
   *
   * @param user - Данные текущего пользователя из JWT.
   * @param query - Query-параметры: `month`, `year`, `limit`, `offset`.
   * @returns Массив транзакций.
   */
  @Get()
  @ApiOperation({ summary: 'Получить список транзакций' })
  @ApiResponse({ status: 200, description: 'Список транзакций.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  findAll(@CurrentUser() user: PublicUser, @Query() query: QueryTransactionsDto) {
    return this.transactionsService.findAll(user.id, query);
  }

  /**
   * Возвращает одну транзакцию по идентификатору.
   *
   * @param user - Данные текущего пользователя из JWT.
   * @param id - Идентификатор транзакции (UUID).
   * @returns Найденная транзакция.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Получить транзакцию по ID' })
  @ApiParam({ name: 'id', description: 'UUID транзакции' })
  @ApiResponse({ status: 200, description: 'Транзакция найдена.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена.' })
  findOne(@CurrentUser() user: PublicUser, @Param('id') id: string) {
    return this.transactionsService.findOne(user.id, id);
  }

  /**
   * Частично обновляет транзакцию по идентификатору.
   *
   * @param user - Данные текущего пользователя из JWT.
   * @param id - Идентификатор транзакции (UUID).
   * @param dto - Поля для обновления.
   * @returns Обновлённая транзакция.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить транзакцию' })
  @ApiParam({ name: 'id', description: 'UUID транзакции' })
  @ApiResponse({ status: 200, description: 'Транзакция обновлена.' })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  @ApiResponse({ status: 404, description: 'Транзакция или категория не найдена.' })
  update(@CurrentUser() user: PublicUser, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(user.id, id, dto);
  }

  /**
   * Удаляет транзакцию по идентификатору. Возвращает статус 204 без тела ответа.
   *
   * @param user - Данные текущего пользователя из JWT.
   * @param id - Идентификатор транзакции (UUID).
   * @returns `void`
   */
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить транзакцию' })
  @ApiParam({ name: 'id', description: 'UUID транзакции' })
  @ApiResponse({ status: 204, description: 'Транзакция удалена.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена.' })
  remove(@CurrentUser() user: PublicUser, @Param('id') id: string) {
    return this.transactionsService.remove(user.id, id);
  }
}
