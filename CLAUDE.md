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

## Commits

<when_committing>

Используем [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

Формат: `<type>(<scope>): <description>`

| Тип        | Когда использовать                          |
| ---------- | ------------------------------------------- |
| `feat`     | новая функциональность                      |
| `fix`      | исправление бага                            |
| `refactor` | рефакторинг без изменения поведения         |
| `style`    | форматирование, пробелы, точки с запятой    |
| `test`     | добавление/изменение тестов                 |
| `docs`     | документация                                |
| `chore`    | обслуживание: зависимости, конфиги, скрипты |
| `perf`     | улучшение производительности                |
| `ci`       | изменения CI/CD                             |

Scope — опциональный, указывает на область кода: `backend`, `frontend`, `shared`, `auth`, `prisma`, и т.д.

Примеры:

```
feat(auth): добавить refresh token
fix(backend): исправить CORS при logout
refactor(frontend): перенести логику в Pinia store
chore: обновить зависимости
```

Breaking changes: добавить `!` после type/scope или footer `BREAKING CHANGE:`.

</when_committing>

## Branching (GitHub Flow)

<when_creating_branch>

Работаем по [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow):

1. `main` — всегда стабильная ветка; прямые коммиты запрещены.
2. Каждая фича/фикс — отдельная ветка от `main`.
3. Именование веток: `<type>/<short-description>` (те же типы, что в Conventional Commits).
   - Примеры: `feat/dashboard`, `fix/auth-cors`, `refactor/pinia-store`
4. После завершения работы — Pull Request в `main`; мёрж только после review.
5. После мёржа ветка удаляется.

</when_creating_branch>

## Pull Requests

<when_creating_pr>

PR создаётся через `gh pr create` после пуша ветки в remote.

**Заголовок** — по Conventional Commits: `<type>(<scope>): <описание>` (до 70 символов).

**Описание** обязательно содержит три раздела:

```
## Что сделано
- краткие пункты по каждому значимому изменению

## API (если изменялся бэкенд)
- новые или изменённые endpoints с сигнатурой

## Чек-лист для ревью
- [ ] типы/DTO в `packages/shared` обновлены
- [ ] фронт и бэк используют типы из `@app/shared`
- [ ] FSD-правило импортов не нарушено
- [ ] новые маршруты добавлены в роутер
```

Перед созданием PR:

1. Убедиться, что ветка основана на актуальном `main`.
2. Проверить `git diff main...HEAD --stat` — нет ли случайных файлов.
3. Обновить план в `.claude/plans/` (отметить выполненные пункты).

</when_creating_pr>

## Workflow

- Перед каждой задачей спрашивать, нужно ли создавать план? Если да, то хранить его в `.claude/plans/` (в корне репозитория).
- Каждый план обязан содержать раздел **Чек-лист задач** — задачи с чекбоксами `- [ ]`, сгруппированные по подсекциям (пример: `.claude/plans/auth-pages.md`).

## Документация

При добавлении функционала проверяй .claude/docs/\*.
Актуализируй файлы при изменении архитектуры или API.
