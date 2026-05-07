# claude-larichev-lessons

Учебный монорепозиторий: трекер расходов.

## Стек

- **Монорепо**: npm workspaces
- **Frontend** (`apps/web`): Vue 3 + Vite + TypeScript + Pinia + Vue Router + Tailwind CSS + Vuetify
- **Backend** (`apps/api`): NestJS + TypeScript
- **БД / ORM**: PostgreSQL (через Docker Compose) + Prisma
- **Shared** (`packages/shared`): общие типы / DTO

## Структура

```
apps/
  web/      Vue-приложение
  api/      Nest-приложение (Prisma в apps/api/prisma)
packages/
  shared/   общие типы между web и api
docker-compose.yml   PostgreSQL для разработки
```

## Первый запуск (после согласования стека)

> Сейчас в репозитории создан **только скелет**. Зависимости не установлены.

```bash
cp .env.example .env
npm install                 # установит зависимости во всех workspace
npm run db:up               # поднимет PostgreSQL в Docker
npm run prisma:generate     # сгенерирует Prisma Client (когда появятся модели)
npm run dev:api             # backend на http://localhost:3000
npm run dev:web             # frontend на http://localhost:5173
```

## Скрипты в корне

| Скрипт | Описание |
| --- | --- |
| `npm run dev:web` | dev-сервер Vue |
| `npm run dev:api` | dev-сервер Nest |
| `npm run build:web` / `build:api` | production-сборки |
| `npm run db:up` / `db:down` | поднять/остановить PostgreSQL в Docker |
| `npm run prisma:generate` | prisma generate в apps/api |
| `npm run prisma:migrate` | prisma migrate dev в apps/api |
