# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Учебный проект — трекер расходов. Монорепо на npm workspaces; зависимости пока не установлены, бизнес-логика и модели данных ещё не написаны (это следующая итерация).

## Architecture

Three workspaces under one root `package.json`:

- **`apps/api`** — NestJS backend. Точка входа `src/main.ts` (CORS + порт из `API_PORT`). `AppModule` подключает `ConfigModule` (глобально) и `PrismaModule`. `PrismaModule` помечен `@Global()` — `PrismaService` (наследник `PrismaClient` с `onModuleInit/onModuleDestroy`) доступен во всех модулях без явного импорта. Prisma-схема в `apps/api/prisma/schema.prisma` (datasource `postgresql`, `DATABASE_URL` из env). Health-endpoint: `GET /health`.
- **`apps/web`** — Vue 3 + Vite + TS. `src/main.ts` собирает приложение из Pinia + Vue Router + Vuetify, импортирует `assets/main.css` с tailwind-директивами. Алиас `@/*` → `src/*`. Vuetify подключается через `vite-plugin-vuetify` с `autoImport`. Tailwind и Vuetify используются вместе — Tailwind для утилитарной разметки, Vuetify для компонентов.
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
- Авторизации сейчас нет — добавится отдельной задачей; не вводить заглушки `User` без согласования.

## Workflow

- Перед каждой задачей создавать план и хранить его в `.claude/plans/` (в корне репозитория).
