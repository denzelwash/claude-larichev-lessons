# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Учебный проект — трекер расходов. Монорепо на npm workspaces. Реализованы модули: `auth`, `categories`, `transactions`, `users` (бэк); страницы авторизации и дашборд (фронт). База данных — PostgreSQL + Prisma с миграциями.

## Architecture

Three workspaces under one root `package.json`:

- **`apps/backend`** (`@app/backend`) — NestJS backend. Подробности: `apps/backend/CLAUDE.md`.
- **`apps/frontend`** (`@app/frontend`) — Vue 3 + Vite + TS. Подробности: `apps/frontend/CLAUDE.md`.
- **`packages/shared`** (`@app/shared`) — общие TS-типы/DTO между фронтом и бэком. При добавлении типов импортировать из `@app/shared`, не дублировать определения.

PostgreSQL для разработки поднимается через `docker-compose.yml` в корне (image `postgres:16`, креды/имя БД из `.env`, healthcheck по `pg_isready`).

## Commands

Run from repo root unless noted. All cross-workspace scripts use `npm -w`.

| Команда                                 | Что делает                            |
| --------------------------------------- | ------------------------------------- |
| `npm install`                           | установка во все workspace            |
| `npm run db:up` / `db:down` / `db:logs` | docker compose с PostgreSQL           |
| `npm run dev:api`                       | Nest в watch-режиме (`apps/backend`)  |
| `npm run dev:web`                       | Vite dev-сервер (`apps/frontend`)     |
| `npm run build:api` / `build:web`       | production-сборки                     |
| `npm run prisma:generate`               | `prisma generate` в `apps/backend`    |
| `npm run prisma:migrate`                | `prisma migrate dev` в `apps/backend` |

Запуск одиночной команды в конкретном workspace: `npm -w apps/backend run <script>` (напр. `npm -w apps/backend run prisma:studio`).

## Environment

`.env` копируется из `.env.example`. Ключевые переменные: `DATABASE_URL` (Prisma + Nest), `API_PORT` (бэк), `WEB_PORT` + `VITE_API_URL` (фронт), `CORS_ORIGIN` (бэк → фронт), `POSTGRES_*` (docker-compose). Один `.env` в корне читается и docker-compose, и Nest (через `@nestjs/config` с `isGlobal: true`).

## Conventions

- Язык документации/комментариев — русский (см. README, заглушки во views).
- Платформа разработки — Windows + PowerShell. В Bash-командах учитывать это (например, `cp` доступен через Git Bash; в PS используется `Copy-Item`).
- Авторизация — JWT (бэк) + Pinia auth store (фронт). Подробности в `apps/backend/CLAUDE.md` и `apps/frontend/CLAUDE.md`.

## Git workflow

Правила коммитов, ветвления и PR вынесены в skills: `commit`, `branch`, `pr` (см. `.claude/skills/`).

## Workflow

IMPORTANT: - Перед каждой задачей спрашивать, нужно ли создавать план? Если да, то хранить его в `.claude/plans/` (в корне репозитория).
IMPORTANT: - Каждый план обязан содержать раздел **Чек-лист задач** — задачи с чекбоксами `- [ ]`, сгруппированные по подсекциям (пример: `.claude/plans/auth-pages.md`).

## Документация

При добавлении функционала проверяй .claude/docs/\*.
Актуализируй файлы при изменении архитектуры или API.
