# claude-larichev-lessons

Учебный монорепозиторий: трекер расходов.

## Стек

- **Монорепо**: npm workspaces
- **Frontend** (`apps/frontend`): Vue 3 + Vite + TypeScript + Pinia + Vue Router + Tailwind CSS + Vuetify
- **Backend** (`apps/backend`): NestJS + TypeScript
- **БД / ORM**: PostgreSQL (через Docker Compose) + Prisma
- **Shared** (`packages/shared`): общие типы / DTO

## Структура

```
apps/
  frontend/   Vue-приложение
  backend/    Nest-приложение (Prisma в apps/backend/prisma)
packages/
  shared/     общие типы между frontend и backend
docker-compose.yml   PostgreSQL для разработки
```

## Первый запуск

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
| `npm run prisma:generate` | prisma generate в apps/backend |
| `npm run prisma:migrate` | prisma migrate dev в apps/backend |
