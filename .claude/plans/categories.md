# Категории трат: модуль Categories

## Context

Авторизация реализована (см. `.claude/plans/auth.md`): есть `User`, `JwtAuthGuard`, `@CurrentUser`, CQRS-инфраструктура в `users/`, глобальный `ValidationPipe` в `main.ts`. Следующий доменный модуль — **категории трат**, предшественник модуля `Expense`. Каждая категория принадлежит пользователю (FK `userId`); CRUD доступен только владельцу.

Взаимодействие с `UsersModule` — через CQRS (используем существующий `FindUserByIdQuery` из `apps/api/src/users/cqrs/queries/`), без прямого импорта `UsersRepository` или `UsersModule` — так же, как сделано в `AuthModule`.

## Решения

- **CQRS ↔ User.** В `CategoriesService.create` через `QueryBus.execute(new FindUserByIdQuery(userId))` проверяем существование пользователя и кидаем `NotFoundException`, если `null`. На `update`/`delete`/`get` достаточно фильтра `where: { id, userId }` — обращения к чужим категориям отдают 404. Это явно демонстрирует CQRS-контракт между модулями без избыточных вызовов на каждый запрос.
- **Внутри Categories** доменную CQRS-инфраструктуру (Commands/Queries/Handlers) НЕ вводим — учебный модуль остаётся на простом `Service` + `Repository`. CQRS подключается только ради `QueryBus` (см. п. 4 чек-листа).
- **Без shared-DTO** на этом шаге: общие интерфейсы (`Category`) добавим в `@app/shared` позже, когда фронт начнёт их потреблять.
- **Защита владельца — через `where`**, без отдельной проверки. `findFirst({ where: { id, userId } })` возвращает `null` чужим/несуществующим — единый 404, без утечки информации о существовании ресурса.

## Чек-лист задач

### 1. Зависимости
- [ ] Проверить, что `@nestjs/mapped-types` доступен в `apps/api` (нужен для `PartialType` в `UpdateCategoryDto`). Если нет — `npm -w apps/api i @nestjs/mapped-types`.
- [ ] Остальное (`@nestjs/cqrs`, `class-validator`, `class-transformer`) уже стоит — см. `auth.md`.

### 2. Prisma (`apps/api/prisma/schema.prisma`)
- [ ] Добавить модель `Category` (см. блок ниже) и обратную связь `categories Category[]` в `User`.
- [ ] `npm run prisma:migrate -- --name add_category`
- [ ] `npm run prisma:generate`

### 3. Categories (`apps/api/src/categories/`)
- [ ] `dto/create-category.dto.ts`
  - [ ] `name: string` — `@IsString() @IsNotEmpty() @MaxLength(64)`
  - [ ] `color: string` — `@IsString() @Matches(/^#[0-9a-fA-F]{6}$/)` (HEX `#RRGGBB`)
  - [ ] `icon: string` — `@IsString() @IsNotEmpty() @MaxLength(64)`
- [ ] `dto/update-category.dto.ts` — `class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}`
- [ ] `categories.repository.ts` — обёртка над `PrismaService` (`prisma.category`):
  - [ ] `create(userId, data)` → `prisma.category.create({ data: { ...data, userId } })`
  - [ ] `findAllByUser(userId)` → `findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })`
  - [ ] `findOne(id, userId)` → `findFirst({ where: { id, userId } })`
  - [ ] `update(id, userId, data)` — сначала `findFirst({ where: { id, userId } })`; если `null` — вернуть `null`, иначе `prisma.category.update({ where: { id }, data })`
  - [ ] `remove(id, userId)` — аналогично через `findFirst` + `delete`
- [ ] `categories.service.ts` (инжектит `CategoriesRepository` и `QueryBus`):
  - [ ] `create(userId, dto)` — `await queryBus.execute(new FindUserByIdQuery(userId))` → если `null`: `NotFoundException('User not found')`. Затем `repository.create(userId, dto)`.
  - [ ] `findAll(userId)` → `repository.findAllByUser(userId)`
  - [ ] `findOne(userId, id)` → если `null`: `NotFoundException('Category not found')`
  - [ ] `update(userId, id, dto)` → если `null`: `NotFoundException`
  - [ ] `remove(userId, id)` → если `null`: `NotFoundException`
- [ ] `categories.controller.ts` — `@Controller('categories')`, `@UseGuards(JwtAuthGuard)` на классе:
  - [ ] `POST /categories` → `create(@CurrentUser() user, @Body() dto: CreateCategoryDto)` → `service.create(user.id, dto)`
  - [ ] `GET /categories` → `findAll(@CurrentUser() user)` → `service.findAll(user.id)`
  - [ ] `GET /categories/:id` → `findOne(@CurrentUser() user, @Param('id') id)`
  - [ ] `PATCH /categories/:id` → `update(@CurrentUser() user, @Param('id') id, @Body() dto: UpdateCategoryDto)`
  - [ ] `DELETE /categories/:id` → `remove(@CurrentUser() user, @Param('id') id)`
- [ ] `categories.module.ts` — `imports: [CqrsModule]`, `providers: [CategoriesService, CategoriesRepository]`, `controllers: [CategoriesController]`. **Без импорта `UsersModule`**.

### 4. Подключение
- [ ] `apps/api/src/app.module.ts`: добавить `CategoriesModule` в `imports`.

### 5. Верификация
- [ ] `npm run db:up`
- [ ] `npm run prisma:migrate -- --name add_category`
- [ ] `npm run dev:api` — стартует без ошибок
- [ ] Через `/auth/register` получить `accessToken` пользователя A.
- [ ] `POST /categories` `{ "name":"Еда", "color":"#FF8800", "icon":"restaurant" }` с Bearer A → `201`, объект с `id`, `userId`.
- [ ] `GET /categories` с Bearer A → массив только своих категорий.
- [ ] `GET /categories/:id` (своя) → `200`; чужая или несуществующая → `404`.
- [ ] `PATCH /categories/:id` `{ "name":"Продукты" }` → `200`.
- [ ] `DELETE /categories/:id` → `200/204`. Повторный `GET /categories/:id` → `404`.
- [ ] Валидация: `POST` с `color:"red"` → `400`; без `name` → `400`; с лишним полем → `400` (`forbidNonWhitelisted`).
- [ ] `POST /categories` без `Authorization` → `401`.
- [ ] Создать пользователя B, получить токен; `GET /categories` от B не показывает категории A; `GET/PATCH/DELETE` категории A с токеном B → `404`.

---

## Prisma — модель

```prisma
model User {
  // ...существующие поля
  categories Category[]
}

model Category {
  id        String   @id @default(cuid())
  name      String
  color     String
  icon      String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

## Структура новых файлов

```
apps/api/src/
├── app.module.ts                          (modify: + CategoriesModule)
└── categories/
    ├── categories.module.ts
    ├── categories.controller.ts
    ├── categories.service.ts
    ├── categories.repository.ts
    └── dto/
        ├── create-category.dto.ts
        └── update-category.dto.ts
```

## Эндпоинты

| Метод | Путь | Тело | Ответ |
| --- | --- | --- | --- |
| POST | `/categories` | `{ name, color, icon }` | `Category` |
| GET | `/categories` | — | `Category[]` |
| GET | `/categories/:id` | — | `Category` \| `404` |
| PATCH | `/categories/:id` | `Partial<{ name, color, icon }>` | `Category` \| `404` |
| DELETE | `/categories/:id` | — | `Category` \| `404` |

Все эндпоинты требуют `Authorization: Bearer <JWT>` (`JwtAuthGuard`).

## Переиспользуемые элементы

- `JwtAuthGuard` — `apps/api/src/auth/guards/jwt-auth.guard.ts`
- `@CurrentUser` — `apps/api/src/auth/decorators/current-user.decorator.ts`
- `PublicUser`, `JwtPayload` — `packages/shared/src/auth.ts`
- `FindUserByIdQuery` — `apps/api/src/users/cqrs/queries/find-user-by-id.query.ts` (используется в `CategoriesService` через `QueryBus`)
- `PrismaService` — глобальный, инъекция в `CategoriesRepository` без явного импорта
- Глобальный `ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })` уже в `main.ts`

## Поток вызовов (create)

```
POST /categories
  → JwtAuthGuard → JwtStrategy.validate → FindUserByIdQuery → req.user = PublicUser
  → CategoriesController.create(@CurrentUser() user, dto)
      → CategoriesService.create(user.id, dto)
          → queryBus.execute(new FindUserByIdQuery(user.id))   [внутри Users]
                → FindUserByIdHandler → UsersRepository.findById
          ← PublicUser | null
          → if null: NotFoundException
          → CategoriesRepository.create(user.id, dto) → prisma.category.create
      ← Category
  → 201 Created
```
