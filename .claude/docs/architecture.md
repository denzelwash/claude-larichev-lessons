# Архитектура проекта

## Монорепо

npm workspaces, три пакета:

| Пакет | Путь | Назначение |
|---|---|---|
| `@app/backend` | `apps/backend` | NestJS API |
| `@app/frontend` | `apps/frontend` | Vue 3 SPA |
| `@app/shared` | `packages/shared` | Общие TypeScript-типы и DTO |

---

## Backend (`apps/backend`)

### Стек

NestJS + TypeScript + Prisma + PostgreSQL + Passport JWT.

### Слои внутри модуля

```
Controller  →  Service  →  Repository  →  PrismaService
```

- **Controller** — маршрутизация, декораторы Swagger, извлечение `@CurrentUser()`.
- **Service** — бизнес-логика: валидация владельца ресурса, проверка связанных сущностей, бросание `NotFoundException`.
- **Repository** — прямая работа с Prisma: запросы, фильтрация, пагинация. Возвращает `null` вместо исключения.
- **PrismaService** — глобальный сервис (`PrismaModule` помечен `@Global()`), внедряется во все репозитории без явного импорта.

### Модули

| Модуль | Паттерн | Особенности |
|---|---|---|
| `AppModule` | корневой | подключает `ConfigModule` (global), `PrismaModule`, все фичи |
| `PrismaModule` | инфраструктурный | `@Global()`, экспортирует `PrismaService` |
| `UsersModule` | CQRS | команды и запросы через `CommandBus` / `QueryBus`; не имеет контроллера |
| `AuthModule` | фича | JWT через `@nestjs/jwt` + `passport-jwt`; экспортирует `JwtAuthGuard` |
| `CategoriesModule` | фича | стандартный CRUD; экспортирует `CategoriesRepository` (нужен TransactionsModule) |
| `TransactionsModule` | фича | стандартный CRUD; импортирует `CategoriesModule` для проверки категории |

### Авторизация

- `JwtAuthGuard` — Passport-guard, применяется через `@UseGuards()` на контроллер или метод.
- `@CurrentUser()` — кастомный decorator, извлекает `PublicUser` из `request.user` (заполняется `JwtStrategy`).
- Токен stateless, хранится только на клиенте.

### CQRS (модуль `users`)

`UsersModule` использует `@nestjs/cqrs`:
- `CreateUserCommand` / `CreateUserHandler` — создание пользователя, бросает `ConflictException` при дублировании email (Prisma error P2002).
- `FindUserByIdQuery` / `FindUserByIdHandler` — поиск по id.
- `ValidateCredentialsQuery` / `ValidateCredentialsHandler` — проверка email + пароль при логине.

---

## Frontend (`apps/frontend`)

### Стек

Vue 3 + Vite + TypeScript + Pinia + Vue Router + Tailwind CSS + Vuetify.

### Feature Slice Design (FSD)

```
src/
  app/        ← точка входа, провайдеры (main.ts)
  pages/      ← route-level компоненты (home, login, register, transactions, categories)
  widgets/    ← самодостаточные блоки UI (recent-transactions)
  features/   ← пользовательские сценарии (auth, categories, transactions)
  shared/     ← переиспользуемый код без бизнес-логики (api/http, types)
```

**Правило импортов:** слой может импортировать только из более низких слоёв.
Внутри слоя — только через публичный `index.ts` сегмента.

### HTTP-клиент

`shared/api/http.ts` — axios-инстанс:
- `baseURL` из `VITE_API_URL`.
- Request interceptor — подставляет `Authorization: Bearer <token>` из `localStorage`.
- Response interceptor — при 401 чистит токен и редиректит на `/login`.

### Auth store (`features/auth/model/store.ts`)

Pinia store:
- `user` — `PublicUser | null`, источник истины об аутентификации.
- `token` — JWT из `localStorage`, восстанавливается при инициализации.
- Методы: `loginAction`, `registerAction`, `fetchMe`, `logout`.

### Router guards

`router/index.ts`, `beforeEach`:
- Если токен есть, но `user` не загружен — вызывает `fetchMe()` (восстановление сессии после перезагрузки).
- `meta.requiresAuth` — редирект на `/login` для неаутентифицированных.
- `meta.guest` — редирект на `/` для уже вошедших.

---

## Shared (`packages/shared`)

Только TypeScript-интерфейсы, без runtime-кода:

- `PublicUser`, `JwtPayload`, `AuthResponseDto` — auth.
- `CategoryDto` — категория (включает `createdAt`, `updatedAt`).
- `TransactionDto`, `TransactionType`, `QueryTransactionsParams`, `CreateTransactionInput` — транзакции.
