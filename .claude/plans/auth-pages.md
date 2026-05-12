# Фронтенд страниц логина и регистрации (Vuetify + FSD)

## Context
Нужно реализовать страницы входа и регистрации на фронтенде. Бэкенд готов (NestJS + JWT, эндпоинты `POST /auth/register`, `POST /auth/login`, `GET /auth/me`). UI-библиотека — оставляем **Vuetify 3** (уже подключена). Архитектура переводится на **Feature Slice Design (FSD)**. Задача охватывает: реструктуризацию `src/` под FSD, auth store на Pinia, axios-клиент, роутер с гардами, две формы с валидацией на компонентах Vuetify.

---

## Изменения пакетов (`apps/web`)

```powershell
# Из корня монорепо. Vuetify / @mdi/font / vite-plugin-vuetify НЕ трогаем.
npm install axios -w apps/web
```

---

## Итоговая структура `apps/web/src/`

```
src/
  main.ts                        ← MODIFY (импорт App из app/, без других изменений)
  assets/main.css                ← без изменений
  app/
    App.vue                      ← NEW (перенос из src/App.vue, оставляем v-app/v-main)
  router/
    index.ts                     ← MODIFY (новые маршруты + auth-гарды)
  shared/
    api/
      http.ts                    ← NEW (axios-инстанс + interceptor токена)
    types/
      index.ts                   ← NEW (реэкспорт из @app/shared)
  features/
    auth/
      api/
        authApi.ts               ← NEW (вызовы /auth/login, /auth/register, /auth/me)
      model/
        store.ts                 ← NEW (Pinia auth store)
      index.ts                   ← NEW (публичное API фичи)
  pages/
    login/
      ui/LoginPage.vue           ← NEW (Vuetify-форма)
      index.ts                   ← NEW
    register/
      ui/RegisterPage.vue        ← NEW (Vuetify-форма)
      index.ts                   ← NEW
    home/
      ui/HomePage.vue            ← NEW (перенос из views/HomeView.vue + кнопка выхода)
      index.ts                   ← NEW
```

**Удалить:**
- `src/App.vue` → заменён `src/app/App.vue`
- `src/views/HomeView.vue` → заменён `src/pages/home/ui/HomePage.vue`
- `src/stores/.gitkeep`
- `src/components/.gitkeep`

---

## Принципы FSD (для CLAUDE.md)

Слои (снизу вверх): `shared` → `entities` → `features` → `widgets` → `pages` → `app`.
Импортировать можно только из своего слоя и более низких. Внутри слоя — через публичный `index.ts` сегмента (`features/auth/index.ts`), не лезть в `model/`, `api/`, `ui/` напрямую снаружи.

---

## Детали реализации

### `vite.config.ts` — MODIFY (добавить алиас на shared, Vuetify-плагин не трогаем)
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@app/shared': fileURLToPath(new URL('../../packages/shared/src/index.ts', import.meta.url)),
    },
  },
  server: { port: Number(process.env.WEB_PORT ?? 5173) },
})
```

### `tsconfig.json` — MODIFY (добавить путь)
```json
"paths": {
  "@/*": ["src/*"],
  "@app/shared": ["../../packages/shared/src/index.ts"]
}
```

### `src/main.ts` — MODIFY (Vuetify остаётся; меняется только путь до App)
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './assets/main.css'
import App from './app/App.vue'
import { router } from './router'

const vuetify = createVuetify()

createApp(App).use(createPinia()).use(router).use(vuetify).mount('#app')
```

### `src/app/App.vue` — NEW (перенос текущего App.vue)
```vue
<template>
  <v-app>
    <v-main>
      <v-container>
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>
```

### `src/router/index.ts` — MODIFY
```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/home').then(m => m.HomePage),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/login').then(m => m.LoginPage),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/register').then(m => m.RegisterPage),
      meta: { guest: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (auth.token && !auth.user) {
    await auth.fetchMe().catch(() => auth.logout())
  }
  if (to.meta.requiresAuth && !auth.user) return { name: 'login' }
  if (to.meta.guest && auth.user) return { name: 'home' }
})
```

### `src/shared/api/http.ts` — NEW
```typescript
import axios from 'axios'

export const TOKEN_KEY = 'access_token'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

### `src/shared/types/index.ts` — NEW
```typescript
export type { PublicUser, JwtPayload, AuthResponseDto } from '@app/shared'
```

### `src/features/auth/api/authApi.ts` — NEW
```typescript
import { http } from '@/shared/api/http'
import type { AuthResponseDto, PublicUser } from '@/shared/types'

export interface LoginDto { email: string; password: string }
export interface RegisterDto { name: string; email: string; password: string }

export const loginApi = (dto: LoginDto) =>
  http.post<AuthResponseDto>('/auth/login', dto).then(r => r.data)

export const registerApi = (dto: RegisterDto) =>
  http.post<AuthResponseDto>('/auth/register', dto).then(r => r.data)

export const getMeApi = () =>
  http.get<PublicUser>('/auth/me').then(r => r.data)
```

### `src/features/auth/model/store.ts` — NEW
```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PublicUser } from '@/shared/types'
import { loginApi, registerApi, getMeApi, type LoginDto, type RegisterDto } from '../api/authApi'
import { TOKEN_KEY } from '@/shared/api/http'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<PublicUser | null>(null)
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const loading = ref(false)
  const error = ref<string | null>(null)

  function setToken(t: string) {
    token.value = t
    localStorage.setItem(TOKEN_KEY, t)
  }

  async function fetchMe() {
    user.value = await getMeApi()
  }

  async function loginAction(dto: LoginDto) {
    loading.value = true; error.value = null
    try {
      const { accessToken } = await loginApi(dto)
      setToken(accessToken)
      await fetchMe()
    } catch (e) {
      error.value = extractMessage(e, 'Неверный email или пароль')
      throw e
    } finally { loading.value = false }
  }

  async function registerAction(dto: RegisterDto) {
    loading.value = true; error.value = null
    try {
      const { accessToken } = await registerApi(dto)
      setToken(accessToken)
      await fetchMe()
    } catch (e) {
      error.value = extractMessage(e, 'Ошибка регистрации')
      throw e
    } finally { loading.value = false }
  }

  function logout() {
    user.value = null; token.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  return { user, token, loading, error, fetchMe, loginAction, registerAction, logout }
})

function extractMessage(e: unknown, fallback: string): string {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const r = (e as { response?: { data?: { message?: string } } }).response
    return r?.data?.message ?? fallback
  }
  return fallback
}
```

### `src/features/auth/index.ts` — NEW
```typescript
export { useAuthStore } from './model/store'
export type { LoginDto, RegisterDto } from './api/authApi'
```

### `src/pages/login/ui/LoginPage.vue` — NEW
Используем Vuetify-компоненты:
- `v-container` + `v-row justify="center"` + `v-col` (`cols="12" sm="8" md="5"`)
- `v-card` с `v-card-title "Вход"`, `v-card-text` с `v-form`
- Поля: `v-text-field` (email, type="email"), `v-text-field` (пароль, type="password")
- `v-alert type="error"` при `auth.error`
- `v-btn color="primary" :loading="auth.loading" type="submit"` — «Войти»
- Под формой: `RouterLink to="/register"` — «Нет аккаунта? Зарегистрироваться»
- Валидация через `:rules` массив функций (email required + regex, password required + min 8)
- При успехе: `router.push({ name: 'home' })`

### `src/pages/register/ui/RegisterPage.vue` — NEW
Аналогично LoginPage. Дополнительное поле «Имя» (required, min 2). Ссылка на `/login`. При успехе → `/`.

### `src/pages/home/ui/HomePage.vue` — NEW
- Заголовок `v-card-title`: «Трекер расходов»
- Приветствие: `Привет, {{ auth.user?.name }}!`
- `v-btn @click="onLogout"` — «Выйти» (вызывает `auth.logout()` и `router.push({ name: 'login' })`)

### Barrel-экспорты `pages/*/index.ts`
```typescript
export { default as LoginPage } from './ui/LoginPage.vue'
```
(и аналогично для Register, Home)

---

## `CLAUDE.md` — MODIFY
- Обновить описание `apps/web` (упомянуть FSD-структуру).
- Добавить секцию **Frontend Architecture (FSD)** с описанием слоёв и правилом «сверху вниз».

---

## Проверка

1. `npm install` из корня (подтянет `axios`).
2. `npm run dev:api` — бэк на :3000.
3. `npm run dev:web` — фронт на :5173.
4. `/` без токена → редирект на `/login`.
5. Регистрация с валидными данными → редирект на `/`, имя в шапке.
6. Кнопка «Выйти» → `/login`.
7. Логин с теми же данными → `/`.
8. Перезагрузка страницы → пользователь восстановлен (по токену из localStorage через `/auth/me`).
9. Открыть `/login` будучи авторизованным → редирект на `/`.
10. `npm -w apps/web run build` — ноль ошибок TypeScript.

---

## Примечание

Файл плана будет также скопирован в репозиторий: `.claude/plans/auth-pages.md` (перезапишет предыдущую версию). Это соответствует принятому соглашению — хранить планы в репозитории.
