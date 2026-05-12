# Фронтенд страниц логина и регистрации (Vuetify + FSD)

## Context

Бэкенд авторизации готов (см. `.claude/plans/auth.md`): `POST /auth/register`, `POST /auth/login`, `GET /auth/me` с JWT. Фронтенд (`apps/web`) сейчас содержит одну заглушку `HomeView.vue`, Vuetify подключена, Pinia/Router инициализированы, stores/ и components/ пусты.

Цель — реализовать страницы входа и регистрации, подключить auth store на Pinia, настроить роутер с гардами и перевести структуру `src/` на **Feature Slice Design (FSD)**. UI-библиотека — Vuetify 3 (уже подключена, не меняем).

## Статус: ✅ Выполнено (12.05.2026)

## Чек-лист задач

### 1. Зависимости
- [x] `npm install axios -w apps/web` — HTTP-клиент для вызовов API

### 2. Конфиги
- [x] `apps/web/vite.config.ts` — добавить алиас `@app/shared` → `../../packages/shared/src/index.ts`
- [x] `apps/web/tsconfig.json` — добавить путь `"@app/shared": ["../../packages/shared/src/index.ts"]`

### 3. Shared (`apps/web/src/shared/`)
- [x] `shared/api/http.ts` — axios-инстанс с `baseURL: VITE_API_URL`, Bearer-interceptor из `localStorage`
- [x] `shared/types/index.ts` — реэкспорт `PublicUser`, `JwtPayload`, `AuthResponseDto` из `@app/shared`

### 4. Feature Auth (`apps/web/src/features/auth/`)
- [x] `features/auth/api/authApi.ts` — функции `loginApi`, `registerApi`, `getMeApi` через `http`
- [x] `features/auth/model/store.ts` — Pinia store: `user`, `token`, `loading`, `error`; actions: `loginAction`, `registerAction`, `fetchMe`, `logout`
- [x] `features/auth/index.ts` — публичный barrel: `useAuthStore`, `LoginDto`, `RegisterDto`

### 5. Pages (`apps/web/src/pages/`)
- [x] `pages/login/ui/LoginPage.vue` — форма входа (email + пароль, валидация, v-alert при ошибке, ссылка на /register)
- [x] `pages/login/index.ts` — barrel-экспорт `LoginPage`
- [x] `pages/register/ui/RegisterPage.vue` — форма регистрации (имя + email + пароль, валидация, ссылка на /login)
- [x] `pages/register/index.ts` — barrel-экспорт `RegisterPage`
- [x] `pages/home/ui/HomePage.vue` — главная: приветствие с именем пользователя + кнопка «Выйти»
- [x] `pages/home/index.ts` — barrel-экспорт `HomePage`

### 6. App
- [x] `src/app/App.vue` — перенос `src/App.vue` (сохраняем `v-app` / `v-main`)
- [x] `src/main.ts` — поменять импорт `App` на `./app/App.vue`

### 7. Router (`apps/web/src/router/index.ts`)
- [x] Маршруты `/`, `/login`, `/register` с lazy-import через barrel-экспорты pages
- [x] `meta: { requiresAuth: true }` для `/`, `meta: { guest: true }` для `/login` и `/register`
- [x] `router.beforeEach` — восстановить пользователя из токена (`fetchMe`), применить гарды

### 8. Удалить старые файлы
- [x] `src/App.vue` — заменён `src/app/App.vue`
- [x] `src/views/HomeView.vue` — заменён `src/pages/home/ui/HomePage.vue`
- [x] `src/stores/.gitkeep`
- [x] `src/components/.gitkeep`

### 9. CLAUDE.md
- [x] Обновить описание `apps/web` (FSD, алиас `@app/shared`)
- [x] Добавить секцию **Frontend Architecture (FSD)**
- [x] Исправить конвенции (авторизация теперь реализована)

### 10. Верификация ✅ все прошли
- [x] `npm install` из корня — подтянул `axios`
- [x] `npm run dev:api` — бэк на :3000
- [x] `npm run dev:web` — фронт на :5173
- [x] `/` без токена → редирект на `/login`
- [x] Регистрация с валидными данными → редирект на `/`, имя в шапке
- [x] Кнопка «Выйти» → `/login`
- [x] Логин с теми же данными → `/`
- [x] Перезагрузка страницы → пользователь восстановлен через `GET /auth/me`
- [x] Открыть `/login` авторизованным → редирект на `/`
- [x] `npm -w apps/web run build` — ноль ошибок TypeScript

---

## Структура новых файлов

```
apps/web/src/
├── main.ts                              (modify: импорт App из app/)
├── app/
│   └── App.vue                          (new: перенос с v-app/v-main)
├── router/
│   └── index.ts                         (modify: маршруты + гарды)
├── shared/
│   ├── api/
│   │   └── http.ts                      (new: axios + interceptor)
│   └── types/
│       └── index.ts                     (new: реэкспорт @app/shared)
├── features/
│   └── auth/
│       ├── api/authApi.ts               (new)
│       ├── model/store.ts               (new: Pinia store)
│       └── index.ts                     (new: barrel)
└── pages/
    ├── login/
    │   ├── ui/LoginPage.vue             (new)
    │   └── index.ts
    ├── register/
    │   ├── ui/RegisterPage.vue          (new)
    │   └── index.ts
    └── home/
        ├── ui/HomePage.vue              (new)
        └── index.ts
```

## FSD — правило импортов

Слои (снизу вверх): `shared` → `entities` → `features` → `widgets` → `pages` → `app`.
Слой импортирует только из более низких слоёв. Внутри слоя — только через публичный `index.ts` сегмента, не напрямую в `model/`, `api/`, `ui/`.

## Auth store — контракт

| Поле / Action | Тип | Описание |
| --- | --- | --- |
| `user` | `PublicUser \| null` | текущий пользователь |
| `token` | `string \| null` | JWT из localStorage |
| `loading` | `boolean` | идёт запрос |
| `error` | `string \| null` | последняя ошибка |
| `loginAction(dto)` | `Promise<void>` | логин → сохранить токен → `fetchMe` |
| `registerAction(dto)` | `Promise<void>` | регистрация → сохранить токен → `fetchMe` |
| `fetchMe()` | `Promise<void>` | `GET /auth/me` → записать `user` |
| `logout()` | `void` | очистить `user`, `token`, localStorage |

## Переиспользуемые элементы

- `PublicUser`, `AuthResponseDto` — `packages/shared/src/auth.ts`
- `VITE_API_URL` — env-переменная фронта (`.env`)
- Vuetify компоненты: `v-form`, `v-text-field`, `v-btn`, `v-card`, `v-alert` — autoImport через `vite-plugin-vuetify`
