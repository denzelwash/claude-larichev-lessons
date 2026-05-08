# Категории трат: модуль Categories

## Context

Авторизация реализована (см. `.claude/plans/auth.md`): есть `User`, `JwtAuthGuard`, `@CurrentUser`, CQRS-инфраструктура в `users/`, глобальный `ValidationPipe` в `main.ts`. Следующий доменный модуль — **категории трат**, предшественник модуля `Expense`. Каждая категория принадлежит пользователю (FK `userId`); CRUD доступен только владельцу.

Взаимодействие с `UsersModule` — через CQRS (используем существующий `FindUserByIdQuery` из `apps/api/src/users/cqrs/queries/`), без прямого импорта `UsersRepository` или `UsersModule` — так же, как сделано в `AuthModule`.

## Решения

- **CQRS ↔ User.** В `CategoriesService.create` через `QueryBus.execute(new FindUserByIdQuery(userId))` проверяем существование пользователя и кидаем `NotFoundException`, если `null`. На `update`/`delete`/`get` достаточно фильтра `where: { id, userId }` — обращения к чужим категориям отдают 404. Это явно демонстрирует CQRS-контракт между модулями без избыточных вызовов на каждый запрос.
- **Внутри Categories** доменную CQRS-инфраструктуру (Commands/Queries/Handlers) НЕ вводим — учебный модуль остаётся на простом `Service` + `Repository`. CQRS подключается только ради `QueryBus` (см. п. 4 чек-листа).
- **Без shared-DTO** на этом шаге: общие интерфейсы (`Category`) добавим в `@app/shared` позже, когда фронт начнёт их потреблять.
- **Защита владельца — через `where`**, без отдельной проверки. `findFirst({ where: { id, userId } })` возвращает `null` чужим/несуществующим — единый 404, без утечки информации о существовании ресурса.

## Статус: ✅ Выполнено (08.05.2026)

## Чек-лист задач

### 1. Зависимости
- [x] Проверить, что `@nestjs/mapped-types` доступен в `apps/api` — установлен `^2.1.1`.
- [x] Остальное (`@nestjs/cqrs`, `class-validator`, `class-transformer`) уже стоит — см. `auth.md`.

### 2. Prisma (`apps/api/prisma/schema.prisma`)
- [x] Добавить модель `Category` и обратную связь `categories Category[]` в `User`.
- [x] `npm run prisma:migrate -- --name add_category` (миграция `20260508102115_add_category`)
- [x] `npm run prisma:generate`

### 3. Categories (`apps/api/src/categories/`)
- [x] `dto/create-category.dto.ts`
  - [x] `name: string` — `@IsString() @IsNotEmpty() @MaxLength(64)`
  - [x] `color: string` — `@IsString() @Matches(/^#[0-9a-fA-F]{6}$/)` (HEX `#RRGGBB`)
  - [x] `icon: string` — `@IsString() @IsNotEmpty() @MaxLength(64)`
- [x] `dto/update-category.dto.ts` — `class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}`
- [x] `categories.repository.ts` — обёртка над `PrismaService` (`prisma.category`):
  - [x] `create(userId, data)` → `prisma.category.create({ data: { ...data, userId } })`
  - [x] `findAllByUser(userId)` → `findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })`
  - [x] `findOne(id, userId)` → `findFirst({ where: { id, userId } })`
  - [x] `update(id, userId, data)` — `findFirst` + `prisma.category.update`
  - [x] `remove(id, userId)` — `findFirst` + `delete`
- [x] `categories.service.ts` (инжектит `CategoriesRepository` и `QueryBus`):
  - [x] `create(userId, dto)` — `queryBus.execute(new FindUserByIdQuery(userId))` → если `null`: `NotFoundException`
  - [x] `findAll(userId)` → `repository.findAllByUser(userId)`
  - [x] `findOne(userId, id)` → если `null`: `NotFoundException`
  - [x] `update(userId, id, dto)` → если `null`: `NotFoundException`
  - [x] `remove(userId, id)` → если `null`: `NotFoundException`
- [x] `categories.controller.ts` — `@Controller('categories')`, `@UseGuards(JwtAuthGuard)` на классе:
  - [x] `POST /categories`
  - [x] `GET /categories`
  - [x] `GET /categories/:id`
  - [x] `PATCH /categories/:id`
  - [x] `DELETE /categories/:id`
- [x] `categories.module.ts` — `imports: [CqrsModule]`, без импорта `UsersModule`.

### 4. Подключение
- [x] `apps/api/src/app.module.ts`: добавлен `CategoriesModule`.

### 5. Верификация ✅ все прошли
- [x] `npm run db:up`
- [x] `npm run prisma:migrate -- --name add_category`
- [x] `npm run dev:api` — стартует без ошибок, TypeScript компилируется чисто
- [x] `POST /categories` с Bearer → `201`, объект с `id`, `userId`
- [x] `GET /categories` → массив категорий пользователя
- [x] `GET /categories/:id` (своя) → `200`; несуществующая → `404`
- [x] `PATCH /categories/:id` `{ "name":"Продукты" }` → `200`
- [x] `DELETE /categories/:id` → `200`; повторный GET → `404`
- [x] `color:"red"` → `400`; без `name` → `400`
- [x] без `Authorization` → `401`
- [x] пользователь B: `GET /categories` → `[]`; GET/PATCH/DELETE категории A → `404`

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
