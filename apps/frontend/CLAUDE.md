# CLAUDE.md — apps/frontend

Гайд по frontend-workspace (`apps/frontend`). Дополняет корневой `CLAUDE.md` — общие правила (коммиты, ветки, PR, workflow) описаны там.

## Architecture

Стек: Vue 3 + Vite + TypeScript.

`src/main.ts` собирает приложение: регистрирует Pinia, Vue Router, Vuetify и монтирует `App.vue`. Подключает `assets/main.css` с tailwind-директивами (`@tailwind base/components/utilities`).

**Алиасы (vite.config.ts):**
- `@/*` → `src/*`
- `@app/shared` → `packages/shared/src/index.ts`

Vuetify подключается через `vite-plugin-vuetify` с `autoImport: true` — компоненты не нужно импортировать вручную.

**Разделение ответственности:** Tailwind — утилитарная разметка (отступы, размеры, flex), Vuetify — готовые компоненты (кнопки, формы, таблицы, диалоги).

## Frontend Architecture (FSD)

`src/` организован по [Feature Slice Design](https://feature-sliced.design/):

```
src/
  app/        ← инициализация приложения (App.vue, провайдеры)
  pages/      ← страницы (route-level компоненты)
  widgets/    ← самодостаточные блоки UI (пока не используется)
  features/   ← пользовательские сценарии (auth, и т.д.)
  entities/   ← бизнес-сущности (пока не используется)
  shared/     ← переиспользуемый код без бизнес-логики (api, types, ui)
```

**Правило импортов:** слои могут импортировать только из более низких слоёв (`pages` → `features` → `shared`). Внутри слоя — только через публичный `index.ts` сегмента (не обращаться к `model/`, `api/`, `ui/` напрямую снаружи).

## Auth

Авторизация на фронте — Pinia auth store (`features/auth`). Токен хранится в `localStorage` под ключом `access_token`. Axios-инстанс в `shared/api` подставляет токен в заголовок `Authorization: Bearer`.

## Testing

Раннер: **Vitest** + `jsdom` + `@vue/test-utils`.

- Тесты: `*.spec.ts` рядом с тестируемым файлом.
- Запуск: `npm -w apps/frontend run test` (или `npm run test:web` из корня).
- Для `.vue`-компонентов — `mount`/`shallowMount` из `@vue/test-utils`; для Pinia-сторов — `setActivePinia(createPinia())`.
- Для генерации спеки под конкретный файл: `/test <path-to-file>`.
