# План: тест-инфраструктура + скилл `/test`

## Context

В репозитории нет ни одного теста и ни одного раннера — ни Jest в `apps/backend`, ни Vitest в `apps/frontend`. Пользователь хочет скилл `/test <file>`, который генерирует unit-тесты к указанному файлу. По его указанию: сначала отдельно ставим всю тест-инфраструктуру и конфиги, **скилл сам ничего не ставит и не проверяет** — он работает с уже готовой инфраструктурой.

---

## Часть 1. Установка тест-инфраструктуры

### 1.1 Backend (`apps/backend`) — Jest + ts-jest

Ставим devDependencies: `jest`, `@types/jest`, `ts-jest`, `@nestjs/testing`.

Создаём `apps/backend/jest.config.js`:

```js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@app/shared$': '<rootDir>/../../../packages/shared/src/index.ts',
    '^@app/shared/(.*)$': '<rootDir>/../../../packages/shared/src/$1',
  },
};
```

Скрипты в `apps/backend/package.json`:

```json
"test": "jest",
"test:watch": "jest --watch",
"test:cov": "jest --coverage"
```

### 1.2 Frontend (`apps/frontend`) — Vitest + Vue Test Utils

Ставим devDependencies: `vitest`, `@vue/test-utils`, `@vitest/coverage-v8`, `jsdom`.

Создаём `apps/frontend/vitest.config.ts`:

```ts
import { mergeConfig, defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.spec.ts'],
    },
  })
);
```

Скрипты в `apps/frontend/package.json`:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:cov": "vitest run --coverage"
```

### 1.3 Корневой `package.json`

```json
"test:api": "npm -w apps/backend run test",
"test:web": "npm -w apps/frontend run test",
"test": "npm run test:api && npm run test:web"
```

### 1.4 Smoke-тесты

- `apps/backend/src/app.controller.spec.ts` — проверка `AppController.health()`.
- `apps/frontend/src/shared/__sanity__/sanity.spec.ts` — `expect(1 + 1).toBe(2)`.

### 1.5 Документация

- Корневой `CLAUDE.md` — добавить строки про `test`, `test:api`, `test:web` в таблицу команд.
- `apps/backend/CLAUDE.md` — секция **Testing** (Jest, `*.spec.ts` рядом с файлом).
- `apps/frontend/CLAUDE.md` — секция **Testing** (Vitest, jsdom, Vue Test Utils).

---

## Часть 2. Скилл `/test`

Файл: `.claude/skills/test/skill.md`. Структура по образцу `.claude/skills/pr/skill.md`.

**Frontmatter:**

```yaml
name: test
description: Генерация unit-тестов для файла, переданного аргументом. Создаёт *.spec.ts рядом с файлом и запускает раннер workspace. Jest — для backend, Vitest — для frontend.
model: sonnet
effort: low
disable-model-invocation: true
allowed-tools: Read Write Edit Glob Grep Bash(npm -w *) Bash(npx jest*) Bash(npx vitest*)
argument-hint: "<file-path>"
```

**Разделы:**

- **Параметры** — единственный обязательный `file-path` (относительный от корня).
- **Правила** — `*.spec.ts` рядом с исходником; для backend — Jest + `@nestjs/testing`; для frontend `.ts` — Vitest; для `.vue` — `@vue/test-utils`; покрывать happy path, граничные случаи, ошибки; не запускать в watch-режиме.
- **Шаблоны** — два скелета: Jest+Nest и Vitest, на которые ориентируется модель.
- **Алгоритм**:
  1. Прочитать аргумент. Если не передан — спросить.
  2. Определить workspace: `apps/backend/**` → Jest, `apps/frontend/**` → Vitest, иначе — остановиться и спросить.
  3. Прочитать целевой файл и связанные типы/импорты.
  4. Составить список тест-кейсов (happy path, граничные, ошибки), показать пользователю, получить подтверждение.
  5. Сгенерировать `<basename>.spec.ts` рядом с исходником.
  6. Запустить тесты: `npm -w apps/backend run test -- <path>` или `npm -w apps/frontend run test -- <path>`.
  7. Если красные — исправить тест/мок, перезапустить (исходник не трогать без явной просьбы).
  8. Сообщить итог: путь к спеке, число passed/failed.

---

## Чек-лист задач

### Backend-инфраструктура
- [x] Добавить devDeps в `apps/backend/package.json`: `jest`, `@types/jest`, `ts-jest`, `@nestjs/testing`.
- [x] Добавить скрипты `test`, `test:watch`, `test:cov`.
- [x] Создать `apps/backend/jest.config.js`.
- [x] Создать `apps/backend/src/app.controller.spec.ts` (smoke).
- [x] `npm -w apps/backend run test` — зелёный.

### Frontend-инфраструктура
- [x] Добавить devDeps в `apps/frontend/package.json`: `vitest`, `@vue/test-utils`, `@vitest/coverage-v8`, `jsdom`.
- [x] Добавить скрипты `test`, `test:watch`, `test:cov`.
- [x] Создать `apps/frontend/vitest.config.ts`.
- [x] Создать `apps/frontend/src/shared/__sanity__/sanity.spec.ts` (smoke).
- [x] `npm -w apps/frontend run test` — зелёный.

### Корень и документация
- [x] В корневой `package.json` добавить `test`, `test:api`, `test:web`.
- [x] `npm install` из корня.
- [x] `npm test` из корня — оба workspace зелёные.
- [x] Обновить корневой `CLAUDE.md`.
- [x] Обновить `apps/backend/CLAUDE.md`.
- [x] Обновить `apps/frontend/CLAUDE.md`.

### Скилл `/test`
- [x] Создать `.claude/skills/test/skill.md`.
- [x] Frontmatter: `name`, `description`, `argument-hint`, `allowed-tools`.
- [x] Разделы: Параметры, Правила, Шаблоны, Алгоритм.
- [x] Проверить скилл на `apps/backend/src/auth/auth.service.ts`.

---

## Критичные файлы

**Создаются:**
- `apps/backend/jest.config.js`
- `apps/backend/src/app.controller.spec.ts`
- `apps/frontend/vitest.config.ts`
- `apps/frontend/src/shared/__sanity__/sanity.spec.ts`
- `.claude/skills/test/skill.md`

**Меняются:**
- `package.json` (корень)
- `apps/backend/package.json`
- `apps/frontend/package.json`
- `CLAUDE.md` (корень)
- `apps/backend/CLAUDE.md`
- `apps/frontend/CLAUDE.md`

## Верификация

1. `npm install` без ошибок.
2. `npm run test:api` — Jest зелёный.
3. `npm run test:web` — Vitest зелёный.
4. `npm test` — оба workspace зелёные.
5. `/test apps/backend/src/auth/auth.service.ts` — скилл генерирует спеку, Jest проходит.
6. `/test apps/frontend/src/features/auth/model/auth.store.ts` — скилл генерирует спеку, Vitest проходит.
