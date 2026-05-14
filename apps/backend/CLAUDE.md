# CLAUDE.md — apps/backend

Гайд по backend-workspace (`apps/backend`). Дополняет корневой `CLAUDE.md` — общие правила (коммиты, ветки, PR, workflow) описаны там.

## Architecture

Точка входа: `src/main.ts` — настраивает CORS (origin из `CORS_ORIGIN`) и запускает сервер на порту `API_PORT`.

`AppModule` подключает:
- `ConfigModule` — глобально, читает `.env` из корня репозитория.
- `PrismaModule` — помечен `@Global()`, поэтому `PrismaService` доступен во всех модулях без явного импорта в каждый.

`PrismaService` наследует `PrismaClient` и управляет соединением через `onModuleInit` / `onModuleDestroy`.

Health-endpoint: `GET /health`.

## Modules

Реализованные модули в `src/`:

| Модуль         | Назначение                        |
| -------------- | --------------------------------- |
| `auth`         | регистрация, логин, JWT-токены    |
| `users`        | управление пользователями         |
| `categories`   | категории расходов                |
| `transactions` | транзакции (расходы/доходы)       |
| `prisma`       | обёртка над Prisma Client         |

## Prisma

Схема: `prisma/schema.prisma` (datasource `postgresql`, `DATABASE_URL` из env).
Миграции: `prisma/migrations/`.

**Convention:** перед добавлением или изменением модели — обновить `schema.prisma`, затем:
```
npm run prisma:migrate   # создаёт и применяет миграцию
npm run prisma:generate  # обновляет Prisma Client
```

Для Prisma Studio: `npm -w apps/backend run prisma:studio`.

## Auth

JWT через `@nestjs/jwt` + Passport (`passport-jwt`). Бэк выдаёт токен при логине и проверяет его через `JwtAuthGuard` на защищённых маршрутах. Токен не хранится на сервере (stateless).
