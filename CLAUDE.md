# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Учебный проект — трекер расходов. Монорепо на npm workspaces; зависимости пока не установлены, бизнес-логика и модели данных ещё не написаны (это следующая итерация).

## Architecture

Three workspaces under one root `package.json`:

- **`apps/api`** — NestJS backend. Точка входа `src/main.ts` (CORS + порт из `API_PORT`). `AppModule` подключает `ConfigModule` (глобально) и `PrismaModule`. `PrismaModule` помечен `@Global()` — `PrismaService` (наследник `PrismaClient` с `onModuleInit/onModuleDestroy`) доступен во всех модулях без явного импорта. Prisma-схема в `apps/api/prisma/schema.prisma` (datasource `postgresql`, `DATABASE_URL` из env). Health-endpoint: `GET /health`.
- **`apps/web`** — Vue 3 + Vite + TS. `src/main.ts` собирает приложение из Pinia + Vue Router + Vuetify, импортирует `assets/main.css` с tailwind-директивами. Алиасы: `@/*` → `src/*`, `@app/shared` → `packages/shared/src/index.ts`. Vuetify подключается через `vite-plugin-vuetify` с `autoImport`. Архитектура — **Feature Slice Design (FSD)**: слои `shared/`, `features/`, `pages/`, `app/` в `src/`. Tailwind для утилитарной разметки, Vuetify для компонентов.
- **`packages/shared`** (`@app/shared`) — общие TS-типы/DTO между фронтом и бэком. Сейчас пустой; при добавлении типов импортировать из `@app/shared`, не дублировать определения между `apps/web` и `apps/api`.

PostgreSQL для разработки поднимается через `docker-compose.yml` в корне (image `postgres:16`, креды/имя БД из `.env`, healthcheck по `pg_isready`).

## Commands

Run from repo root unless noted. All cross-workspace scripts use `npm -w`.

| Команда | Что делает |
| --- | --- |
| `npm install` | установка во все workspace |
| `npm run db:up` / `db:down` / `db:logs` | docker compose с PostgreSQL |
| `npm run dev:api` | Nest в watch-режиме (`apps/api`) |
| `npm run dev:web` | Vite dev-сервер (`apps/web`) |
| `npm run build:api` / `build:web` | production-сборки |
| `npm run prisma:generate` | `prisma generate` в `apps/api` |
| `npm run prisma:migrate` | `prisma migrate dev` в `apps/api` |

Запуск одиночной команды в конкретном workspace: `npm -w apps/api run <script>` (напр. `npm -w apps/api run prisma:studio`).

## Environment

`.env` копируется из `.env.example`. Ключевые переменные: `DATABASE_URL` (Prisma + Nest), `API_PORT` (бэк), `WEB_PORT` + `VITE_API_URL` (фронт), `CORS_ORIGIN` (бэк → фронт), `POSTGRES_*` (docker-compose). Один `.env` в корне читается и docker-compose, и Nest (через `@nestjs/config` с `isGlobal: true`).

## Conventions

- Язык документации/комментариев — русский (см. README, заглушки во views).
- Платформа разработки — Windows + PowerShell. В Bash-командах учитывать это (например, `cp` доступен через Git Bash; в PS используется `Copy-Item`).
- Перед добавлением моделей Prisma всегда обновлять `apps/api/prisma/schema.prisma`, затем `npm run prisma:migrate` и `npm run prisma:generate`.
- Авторизация реализована через JWT (бэк) + Pinia auth store (фронт). Токен хранится в `localStorage` под ключом `access_token`.

## Frontend Architecture (FSD)

`apps/web/src/` организован по [Feature Slice Design](https://feature-sliced.design/):

```
src/
  app/        ← инициализация приложения (App.vue)
  pages/      ← страницы (route-level компоненты)
  widgets/    ← самодостаточные блоки UI (пока не используется)
  features/   ← пользовательские сценарии (auth, и т.д.)
  entities/   ← бизнес-сущности (пока не используется)
  shared/     ← переиспользуемый код без бизнес-логики (api, types, ui)
```

**Правило импортов:** слои могут импортировать только из более низких слоёв (`pages` → `features` → `shared`). Внутри слоя — только через публичный `index.ts` сегмента (не лезть в `model/`, `api/`, `ui/` напрямую снаружи).

## Commits

Используем [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

Формат: `<type>(<scope>): <description>`

| Тип | Когда использовать |
| --- | --- |
| `feat` | новая функциональность |
| `fix` | исправление бага |
| `refactor` | рефакторинг без изменения поведения |
| `style` | форматирование, пробелы, точки с запятой |
| `test` | добавление/изменение тестов |
| `docs` | документация |
| `chore` | обслуживание: зависимости, конфиги, скрипты |
| `perf` | улучшение производительности |
| `ci` | изменения CI/CD |

Scope — опциональный, указывает на область кода: `api`, `web`, `shared`, `auth`, `prisma`, и т.д.

Примеры:
```
feat(auth): добавить refresh token
fix(api): исправить CORS при logout
refactor(web): перенести логику в Pinia store
chore: обновить зависимости
```

Breaking changes: добавить `!` после type/scope или footer `BREAKING CHANGE:`.

## Branching (GitHub Flow)

Работаем по [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow):

1. `main` — всегда стабильная ветка; прямые коммиты запрещены.
2. Каждая фича/фикс — отдельная ветка от `main`.
3. Именование веток: `<type>/<short-description>` (те же типы, что в Conventional Commits).
   - Примеры: `feat/dashboard`, `fix/auth-cors`, `refactor/pinia-store`
4. После завершения работы — Pull Request в `main`; мёрж только после review.
5. После мёржа ветка удаляется.

## Workflow

- Перед каждой задачей создавать план и хранить его в `.claude/plans/` (в корне репозитория).
- Каждый план обязан содержать раздел **Чек-лист задач** — задачи с чекбоксами `- [ ]`, сгруппированные по подсекциям (пример: `.claude/plans/auth-pages.md`).
