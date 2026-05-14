# План: переименование папок + разделение CLAUDE.md по workspace

## Context

Две задачи в одном PR:

1. **Переименование** `apps/api` → `apps/backend`, `apps/web` → `apps/frontend` — для единообразия с терминологией проекта.
2. **Разделение CLAUDE.md** — сейчас весь контекст в одном корневом файле (~136 строк). Claude Code автоматически подгружает `CLAUDE.md` из подпапки при работе с файлами в ней, поэтому вынос фронт/бэк-деталей в sub-файлы снижает шум и даёт релевантный контекст там, где он нужен.

Дополнительно: описание проекта в корневом файле устарело (сказано «зависимости не установлены, бизнес-логика не написана», хотя уже есть модули `auth`, `categories`, `transactions`, `users` и миграции Prisma). Актуализируем по ходу.

## Решения по итогам уточнений

- **Commands** в корневом CLAUDE.md — остаются целиком, в подфайлы не дублируются.
- **Актуализация** описания проекта — в рамках этой задачи.
- Переименование идёт **первым** — CLAUDE.md создаются уже в новых путях.

## Шаг 1: Переименование папок

**Команды PowerShell (из корня репо):**
```powershell
Rename-Item apps\api apps\backend
Rename-Item apps\web apps\frontend
```

**Файлы, требующие правок после переименования:**

| Файл | Что менять |
|------|-----------|
| `package.json` (корень) | `apps/api` → `apps/backend` и `apps/web` → `apps/frontend` в 6 скриптах |
| `apps/backend/package.json` | `"name": "@app/api"` → `"@app/backend"`; скрипт `start:prod`: `dist/apps/api/` → `dist/apps/backend/` |
| `apps/backend/nest-cli.json` | `"entryFile": "apps/api/src/main"` → `"apps/backend/src/main"` |
| `README.md` | упоминания `apps/api` и `apps/web` |
| `apps/frontend/package.json` | `"name": "@app/web"` → `"@app/frontend"` (если есть) |

**`apps/backend/tsconfig.json`** — чистый, правок не нужно (пути относительные).

**`package-lock.json`** — не редактировать вручную; регенерировать через `npm install` после всех правок в `package.json`.

## Шаг 2: Разделение CLAUDE.md

**Файлы:**
- `CLAUDE.md` (корень) — редактируется
- `apps/backend/CLAUDE.md` — создаётся
- `apps/frontend/CLAUDE.md` — создаётся

### Корневой `CLAUDE.md` (общее для всего репо)

- **Project** — обновить: убрать «зависимости не установлены / бизнес-логика не написана»; упомянуть реальные модули (`auth`, `categories`, `transactions`, `users`) и миграции.
- **Architecture** — оставить только высокоуровневый обзор трёх workspace + Docker/PostgreSQL. Убрать детали NestJS/Prisma и Vue/FSD — они уходят в подфайлы. Добавить указатели: «подробности: `apps/backend/CLAUDE.md`, `apps/frontend/CLAUDE.md`».
- **Commands** — без изменений, целиком в корне (пути уже обновлены на шаге 1).
- **Environment** — без изменений.
- **Conventions** — оставить: язык (русский), платформа (Windows + PowerShell), авторизация (JWT, см. подфайлы). Убрать Prisma-пункт (→ backend) и детали auth (→ разделить по подфайлам).
- **Commits / Branching / Pull Requests** — без изменений, с тегами `<when_committing>` / `<when_creating_branch>` / `<when_creating_pr>`.
- **Workflow** — без изменений.

### `apps/backend/CLAUDE.md`

- Шапка: «гайд по backend-workspace (`apps/backend`), дополняет корневой `CLAUDE.md`».
- **Architecture** — `src/main.ts` (CORS + `API_PORT`), `AppModule` → `ConfigModule` (глобально) + `PrismaModule`, `PrismaModule @Global()`, `PrismaService` (наследник `PrismaClient` с `onModuleInit/onModuleDestroy`), health-endpoint `GET /health`.
- **Modules** — `auth`, `categories`, `transactions`, `users`, `prisma`.
- **Prisma** — схема в `prisma/schema.prisma` (datasource `postgresql`, `DATABASE_URL`), папка `prisma/migrations/`. Convention: обновлять схему → `npm run prisma:migrate` → `npm run prisma:generate`.
- **Auth** — JWT через Passport, выдача/проверка токена на бэке.

### `apps/frontend/CLAUDE.md`

- Шапка: «гайд по frontend-workspace (`apps/frontend`), дополняет корневой `CLAUDE.md`».
- **Architecture** — Vue 3 + Vite + TS, `src/main.ts`: Pinia + Vue Router + Vuetify + `assets/main.css` (tailwind). Алиасы: `@/*` → `src/*`, `@app/shared` → `packages/shared/src/index.ts`. Vuetify через `vite-plugin-vuetify` с `autoImport`. Tailwind — утилиты, Vuetify — компоненты.
- **FSD** — перенести секцию целиком: дерево слоёв (`app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`) и правило импортов (`pages` → `features` → `shared`, внутри — только через `index.ts`).
- **Auth** — Pinia auth store, токен в `localStorage['access_token']`.

## Verification

1. `npm run dev:api` (теперь `dev:api` указывает на `apps/backend`) — Nest стартует без ошибок.
2. `npm run dev:web` (теперь указывает на `apps/frontend`) — Vite стартует.
3. `git diff --stat` — ожидается: переименования `apps/api → apps/backend` и `apps/web → apps/frontend`, изменения в `package.json`, `nest-cli.json`, `README.md`, `CLAUDE.md`, 2 новых sub-CLAUDE.md.
4. Прочитать все три CLAUDE.md: нет дублей, нет старых путей (`apps/api`, `apps/web`), теги `<when_*>` не повреждены.

## Чек-лист задач

### Шаг 1: Переименование
- [x] `Rename-Item apps\api apps\backend`
- [x] `Rename-Item apps\web apps\frontend`
- [x] Обновить `package.json` (корень) — 6 скриптов
- [x] Обновить `apps/backend/package.json` — `name` + `start:prod`
- [x] Обновить `apps/backend/nest-cli.json` — `entryFile`
- [x] Обновить `apps/frontend/package.json` — `name` (если нужно)
- [x] Обновить `README.md`
- [x] `npm install` — регенерировать `package-lock.json`

### Шаг 2: Корневой CLAUDE.md
- [x] Актуализировать **Project**
- [x] Сжать **Architecture** + указатели на подфайлы
- [x] Почистить **Conventions**

### Шаг 3: apps/backend/CLAUDE.md
- [x] Создать файл с шапкой
- [x] Architecture (NestJS)
- [x] Modules
- [x] Prisma (детали + convention)
- [x] Auth (JWT, бэк)

### Шаг 4: apps/frontend/CLAUDE.md
- [x] Создать файл с шапкой
- [x] Architecture (Vue/Vite/Vuetify + алиасы)
- [x] FSD (перенести целиком)
- [x] Auth (Pinia store + `access_token`)

### Финал
- [x] Прочитать все три CLAUDE.md — нет дублей, нет старых путей
- [x] `npm run dev:api` / `dev:web` — оба стартуют
- [x] `git diff --stat`
