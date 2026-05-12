# Модуль транзакций (NestJS)

## Context

Центральная сущность трекера расходов — транзакции (доходы/расходы). Бэкенд уже имеет авторизацию (JWT) и модуль категорий (`apps/api/src/categories/`), который служит образцом структуры. В этой итерации делаем **только бэкенд**: модель данных, REST-контроллер с CRUD, фильтрация списка по месяцу/году. Фронт — отдельной задачей.

Транзакция привязана к пользователю (`userId`) и категории (`categoryId`). При удалении категории все её транзакции удаляются каскадно (`onDelete: Cascade`).

## Чек-лист задач

### 1. Prisma — модель Transaction
- [ ] В `apps/api/prisma/schema.prisma` добавить enum `TransactionType { income, expense }`
- [ ] Добавить модель `Transaction`: `id` (cuid), `amount` (Decimal @db.Decimal(12,2)), `type` (TransactionType), `description` (String?), `date` (DateTime), `categoryId` (String), `userId` (String), `createdAt`, `updatedAt`
- [ ] Relations: `user` (onDelete: Cascade), `category` (onDelete: Cascade)
- [ ] Индексы: `@@index([userId])`, `@@index([categoryId])`, `@@index([userId, date])`
- [ ] В модель `User` добавить обратную связь `transactions Transaction[]`
- [ ] В модель `Category` добавить обратную связь `transactions Transaction[]`
- [ ] `npm run prisma:migrate -- --name add-transactions`
- [ ] `npm run prisma:generate`

### 2. DTO (`apps/api/src/transactions/dto/`)
- [ ] `create-transaction.dto.ts` — `amount` (`@IsNumber`, `@IsPositive`), `type` (`@IsEnum(TransactionType)`), `description` (`@IsString` `@IsOptional` `@MaxLength(255)`), `date` (`@IsDateString`), `categoryId` (`@IsString` `@IsNotEmpty`)
- [ ] `update-transaction.dto.ts` — `extends PartialType(CreateTransactionDto)`
- [ ] `query-transactions.dto.ts` — `month` (`@IsInt` `@Min(1)` `@Max(12)` `@IsOptional` + `@Type(() => Number)`), `year` (`@IsInt` `@Min(1970)` `@IsOptional` + `@Type(() => Number)`). При указании одного из параметров — второй обязателен (валидация в сервисе или через `@ValidateIf`)

### 3. Repository (`apps/api/src/transactions/transactions.repository.ts`)
По образцу `categories.repository.ts`:
- [ ] `create(userId, dto): Promise<Transaction>` — `prisma.transaction.create`
- [ ] `findAllByUser(userId, range?: { gte: Date; lt: Date }): Promise<Transaction[]>` — фильтр `where: { userId, ...(range && { date: range }) }`, `orderBy: { date: 'desc' }`
- [ ] `findOne(id, userId): Promise<Transaction | null>` — `findFirst({ where: { id, userId } })`
- [ ] `update(id, userId, dto): Promise<Transaction | null>` — `updateMany` + `findFirst`, как в categories
- [ ] `remove(id, userId): Promise<Transaction | null>` — аналогично

### 4. Service (`apps/api/src/transactions/transactions.service.ts`)
По образцу `categories.service.ts`:
- [ ] Внедрить `TransactionsRepository` и `CategoriesRepository` (для проверки принадлежности категории пользователю при create/update)
- [ ] `create(userId, dto)` — сначала `categoriesRepo.findOne(dto.categoryId, userId)`, при отсутствии `NotFoundException('Category not found')`; иначе создать
- [ ] `findAll(userId, query)` — если переданы `month` + `year`, посчитать `gte = new Date(year, month-1, 1)`, `lt = new Date(year, month, 1)`; передать в repo
- [ ] `findOne`, `update`, `remove` — `NotFoundException` при `null`
- [ ] При `update` с новым `categoryId` — снова проверять принадлежность категории

### 5. Controller (`apps/api/src/transactions/transactions.controller.ts`)
- [ ] `@Controller('transactions')` + `@UseGuards(JwtAuthGuard)` на классе
- [ ] `POST /` → `create(@CurrentUser() user, @Body() dto)`
- [ ] `GET /` → `findAll(@CurrentUser() user, @Query() query: QueryTransactionsDto)`
- [ ] `GET /:id` → `findOne(@CurrentUser() user, @Param('id') id)`
- [ ] `PATCH /:id` → `update(@CurrentUser() user, @Param('id') id, @Body() dto)`
- [ ] `DELETE /:id` → `remove(@CurrentUser() user, @Param('id') id)` + `@HttpCode(204)` (если так у categories)

### 6. Module (`apps/api/src/transactions/transactions.module.ts`)
- [ ] `providers: [TransactionsService, TransactionsRepository]`, `controllers: [TransactionsController]`
- [ ] `imports: [CategoriesModule]` (для `CategoriesRepository`) — либо экспортировать репозиторий из `CategoriesModule`, либо подключить через CQRS QueryBus (посмотреть, как сделано в `categories.module.ts` — если репозиторий не экспортирован, добавить в `exports`)
- [ ] Зарегистрировать `TransactionsModule` в `apps/api/src/app.module.ts`

### 7. Верификация
- [ ] `npm run build:api` — ноль ошибок TS
- [ ] `npm run dev:api` — старт без ошибок, миграции применены
- [ ] Регистрация/логин → получить JWT
- [ ] `POST /categories` → создать категорию
- [ ] `POST /transactions` с валидным `categoryId` → 201
- [ ] `POST /transactions` с чужим/несуществующим `categoryId` → 404
- [ ] `GET /transactions` без фильтра → массив
- [ ] `GET /transactions?month=5&year=2026` → только за май 2026
- [ ] `GET /transactions?month=13` → 400 (валидация)
- [ ] `PATCH /transactions/:id` → 200, изменённые поля
- [ ] `DELETE /transactions/:id` → 204
- [ ] `DELETE /categories/:id` → транзакции этой категории удалены каскадно (проверить запросом `GET /transactions`)
- [ ] Запрос без JWT → 401

---

## Структура файлов

```
apps/api/src/transactions/
├── transactions.module.ts
├── transactions.controller.ts
├── transactions.service.ts
├── transactions.repository.ts
└── dto/
    ├── create-transaction.dto.ts
    ├── update-transaction.dto.ts
    └── query-transactions.dto.ts

apps/api/prisma/schema.prisma   (modify: enum + model Transaction + relations)
apps/api/src/app.module.ts       (modify: imports TransactionsModule)
```

## Prisma — модель (черновик)

```prisma
enum TransactionType {
  income
  expense
}

model Transaction {
  id          String          @id @default(cuid())
  amount      Decimal         @db.Decimal(12, 2)
  type        TransactionType
  description String?
  date        DateTime
  categoryId  String
  userId      String
  category    Category        @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([userId])
  @@index([categoryId])
  @@index([userId, date])
}
```

## Контракт API

| Метод | Путь | Body / Query | Ответ |
| --- | --- | --- | --- |
| POST | `/transactions` | `CreateTransactionDto` | `Transaction` (201) |
| GET | `/transactions` | `?month=1..12&year=YYYY` (опц.) | `Transaction[]` |
| GET | `/transactions/:id` | — | `Transaction` или 404 |
| PATCH | `/transactions/:id` | `UpdateTransactionDto` | `Transaction` |
| DELETE | `/transactions/:id` | — | 204 |

Все эндпоинты защищены `JwtAuthGuard`; пользователь подставляется через `@CurrentUser()`. Все запросы фильтруются по `userId` на уровне репозитория.

## Переиспользуемые элементы

- `JwtAuthGuard` — `apps/api/src/auth/guards/jwt-auth.guard.ts`
- `@CurrentUser()` — `apps/api/src/auth/decorators/current-user.decorator.ts`
- `PrismaService` (глобальный) — `apps/api/src/prisma/prisma.service.ts`
- `CategoriesRepository` — `apps/api/src/categories/categories.repository.ts` (нужно экспортировать из `CategoriesModule`, если ещё не экспортирован)
- Шаблон структуры — модуль `categories/` целиком
- Глобальный `ValidationPipe` с `transform: true` (`main.ts`) — обеспечивает работу `@Type(() => Number)` в query-DTO

## Решения

- **Decimal(12,2)** для `amount` — для денег не используем Float; `class-validator` принимает number, Prisma сам приводит к Decimal.
- **`description` опционален** — описание может отсутствовать (например, перевод между категориями).
- **Каскадное удаление** при удалении категории — учебный проект, простой подход (подтверждено пользователем).
- **Фильтр по месяцу** реализуется через диапазон дат `[start, nextMonthStart)` — индекс `[userId, date]` отрабатывает оптимально.
- **Валидация принадлежности категории** делается в сервисе, а не на уровне БД, чтобы вернуть осмысленную ошибку 404.
