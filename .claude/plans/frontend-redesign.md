# Редизайн фронтенда: light/sky dashboard

## Context

Текущий фронт (`apps/frontend`, Vue 3 + Vuetify 3 + Tailwind 3) использует дефолтную тему Vuetify и Open Sans. Дизайн утилитарный: топбар + сайдбар, главный экран — только виджет последних транзакций без графиков и статистики.

Пользователь хочет применить стиль референса (см. приложенный скриншот): светлая sky-палитра, белые карточки на пастельно-голубом фоне, синий primary, сайдбар без топбара, дашборд с тремя stat-карточками, area-графиком трендов, donut-графиком расходов по категориям и списком последних расходов. По итогам уточнений:

- **Скоуп:** Layout + Dashboard + Auth. Страницы `/transactions` и `/categories` остаются заглушками, но получают новый визуал.
- **Графики:** ApexCharts через `vue3-apexcharts` — ближе всего к референсу по дефолтам.
- **Данные дашборда:** моки на фронте + TODO-комментарий в коде про будущий бэкенд `GET /dashboard/summary`.

## Aesthetic direction

- **Палитра.** Фон страницы — мягкий вертикальный sky-gradient (`#EEF4FF → #F8FBFF`). Карточки — `#FFFFFF` с лёгкой тенью `0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(37,99,235,.12)` и радиусом 20px. Primary — `#2563EB`; surface-tint для активного пункта — `#E8F0FF`; success — `#16A34A`; текст — `#0F172A` / `#64748B`.
- **Типографика.** Body — **Plus Jakarta Sans** (характернее Inter, остаётся read-friendly). Числа и заголовки больших значений — **Sora** (геометричная, отлично читается для сумм). Подключаются через Google Fonts в `index.html`.
- **Композиция.** Сайдбар 264px фиксированной ширины (без collapsible на десктопе), без топбара. Контент с горизонтальным паддингом 32px, вертикальным ритмом 24px между секциями. Сетка дашборда: 3 stat-карточки (3 колонки на ≥md), затем 2 чарта (`2fr / 1fr`), затем Recent Expenses на всю ширину.
- **Микродетали.** Кнопка "+ Добавить расход" — pill (`rounded-full`). Активный пункт сайдбара — голубой fill + синий текст/иконка. Stat-значения — `font-sora`, 32px, `tracking-tight`. Delta-метка — `text-emerald-600` 13px.

## Файлы и изменения

### Конфиг и зависимости

- `apps/frontend/package.json` — добавить `apexcharts@^5.10.0` и `vue3-apexcharts@^1.11.1` в `dependencies`.
- `apps/frontend/index.html` — `<link rel="preconnect">` к Google Fonts и подключить Plus Jakarta Sans + Sora.
- `apps/frontend/tailwind.config.js` — расширить: `fontFamily.sans/display`, `colors.brand/ink/surface`, `borderRadius.card`, `boxShadow.card`, `backgroundImage.app-shell/auth-brand`.
- `apps/frontend/src/assets/main.css` — body styles, класс `.app-shell`, `.app-main`, `.sidebar`, `.page-card`. Vuetify-оверрайды (только `background: transparent`, `padding: 0`).
- `apps/frontend/src/main.ts` — кастомная тема Vuetify `expenseLight` (primary `#2563EB`) + регистрация `VueApexCharts`.

### Layout / shell

- `apps/frontend/src/app/App.vue` — убран `v-app-bar` и `v-navigation-drawer`. Shell: flex `<SidebarNav> + <main>` при наличии auth.user, иначе просто `<RouterView>`.
- `apps/frontend/src/widgets/sidebar/ui/SidebarNav.vue` *(новый)* — логотип, инициалы пользователя, nav-ссылки (Дашборд/Транзакции/Категории/Настройки-disabled), кнопка выхода.
- `apps/frontend/src/widgets/sidebar/index.ts` — public API.

### Shared UI

- `apps/frontend/src/shared/ui/AppCard.vue` *(новый)* — `<section class="page-card">` со слотами `header` и default.
- `apps/frontend/src/shared/ui/PageHeader.vue` *(новый)* — `<h1>` + `<slot name="actions" />`.
- `apps/frontend/src/shared/ui/index.ts` — экспорт.

### Dashboard

- `apps/frontend/src/widgets/dashboard/model/mockData.ts` *(новый)* — `mockSummary` с TODO на `GET /dashboard/summary`.
- `apps/frontend/src/widgets/dashboard/ui/StatCard.vue` *(новый)* — label, value (font-display), delta.
- `apps/frontend/src/widgets/dashboard/ui/SpendingTrendChart.vue` *(новый)* — ApexCharts area, smooth, gradient fill.
- `apps/frontend/src/widgets/dashboard/ui/CategoryDonut.vue` *(новый)* — ApexCharts donut, центральная подпись, легенда.
- `apps/frontend/src/widgets/dashboard/index.ts` — public API.
- `apps/frontend/src/pages/home/ui/HomePage.vue` — PageHeader + 3 StatCard + 2 графика (3fr/2fr) + RecentTransactionsList + диалог AddExpense.
- `apps/frontend/src/widgets/recent-transactions/ui/RecentTransactionsList.vue` — рестайл: `page-card`, строки flex с иконкой/текстом/суммой.

### Auth

- `apps/frontend/src/pages/login/ui/LoginPage.vue` — split-layout: синяя brand-панель слева + форма справа. Кнопка — `v-btn color="primary"`.
- `apps/frontend/src/pages/register/ui/RegisterPage.vue` — аналогично login.

### Заглушки в новом стиле

- `apps/frontend/src/pages/transactions/ui/TransactionsPage.vue` — PageHeader + page-card с empty-state.
- `apps/frontend/src/pages/categories/ui/CategoriesPage.vue` — то же.

## Принципы реализации

- **Vuetify ↔ Tailwind:** интерактивные элементы (формы, диалоги, кнопки) — `v-btn`/`v-text-field` Vuetify. Layout/spacing/типографика — Tailwind. Нативные `<button>` не использовать (Vuetify сбрасывает их `background`).
- **FSD соблюдается:** виджеты `sidebar` и `dashboard` имеют свои `index.ts`, импорты идут `pages → widgets → shared`.
- **Язык UI:** русский.
- **Mock-данные изолированы** в `widgets/dashboard/model/mockData.ts`.

## Verification

1. `npm install` в корне.
2. `npm run dev:web` → открыть `http://localhost:5173`.
3. Проверить: `/login` (split-layout, синяя кнопка), `/` (сайдбар, stat-карточки, графики, список), `/register`, `/transactions`, `/categories`, logout.
4. `npm run test:web` — зелёный.
5. Глаз-чек по референсу.

## Чек-лист задач

### Конфиг и зависимости
- [x] Добавить `apexcharts` и `vue3-apexcharts` в `apps/frontend/package.json`
- [x] Подключить Plus Jakarta Sans + Sora в `apps/frontend/index.html`
- [x] Расширить `apps/frontend/tailwind.config.js`
- [x] Обновить `apps/frontend/src/assets/main.css`
- [x] Настроить Vuetify-тему и зарегистрировать `VueApexCharts` в `apps/frontend/src/main.ts`

### Shared UI
- [x] Создать `apps/frontend/src/shared/ui/AppCard.vue`
- [x] Создать `apps/frontend/src/shared/ui/PageHeader.vue`
- [x] Завести `apps/frontend/src/shared/ui/index.ts`

### Layout
- [x] Переписать `apps/frontend/src/app/App.vue` под shell sidebar+main
- [x] Создать `apps/frontend/src/widgets/sidebar/ui/SidebarNav.vue` + `index.ts`

### Dashboard
- [x] Создать `apps/frontend/src/widgets/dashboard/model/mockData.ts`
- [x] Создать `StatCard.vue`
- [x] Создать `SpendingTrendChart.vue`
- [x] Создать `CategoryDonut.vue`
- [x] Завести `apps/frontend/src/widgets/dashboard/index.ts`
- [x] Переписать `apps/frontend/src/pages/home/ui/HomePage.vue`
- [x] Рестайл `RecentTransactionsList.vue`

### Auth
- [x] Рестайл `apps/frontend/src/pages/login/ui/LoginPage.vue` (split-layout)
- [x] Рестайл `apps/frontend/src/pages/register/ui/RegisterPage.vue` (split-layout)

### Заглушки
- [x] Обновить `TransactionsPage.vue` под новый стиль
- [x] Обновить `CategoriesPage.vue` под новый стиль

### Фиксы после ревью
- [x] Кнопки "Войти"/"Зарегистрироваться" — заменить нативный `<button>` на `v-btn` (Vuetify сбрасывал background)
- [x] Кнопка "Добавить расход" — аналогично
- [x] Убрать CSS-оверрайды `v-field__outline__*` (создавали визуальные артефакты)

### Проверка
- [x] `npm install`, `npm run build:web` — чистая сборка
- [x] `npm run test:web` — зелёный
- [ ] Ручная проверка в браузере всех страниц
