# План: главный экран (Dashboard)

## Контекст

Реализуется главный экран expense tracker. Авторизация (JWT), модули `categories` и `transactions` на бэке уже готовы; на фронте есть только auth и заглушка `pages/home/`. Нужно собрать landing-страницу после логина: общий layout с меню, профиль пользователя и список последних 10 транзакций. Параллельно расширяем `GET /transactions` пагинацией (limit/offset) — она потребуется и на будущем экране транзакций.

Принятые решения (см. диалог):
- Пагинация: добавить `limit/offset` в `QueryTransactionsDto`, ответ остаётся массивом.
- Layout: Vuetify `v-app-bar` + `v-navigation-drawer`.
- FSD: `widgets/recent-transactions` использует `features/transactions` (api/store/типы).
- Объём: dashboard + меню; маршруты `/transactions` и `/categories` — заглушки.

## Чек-лист задач

### Бэкенд: пагинация транзакций

- [ ] `apps/api/src/transactions/dto/query-transactions.dto.ts` — добавить `limit?: number` (1..100, default не задаём — отдаём всё, если не передан) и `offset?: number` (>=0, default 0). Использовать `@IsOptional`, `@Type(() => Number)`, `@IsInt`, `@Min`, `@Max`.
- [ ] `apps/api/src/transactions/transactions.repository.ts` — пробросить `take`/`skip` в `prisma.transaction.findMany` (только если параметры заданы). Существующая сортировка `orderBy: { date: 'desc' }` сохраняется.
- [ ] `apps/api/src/transactions/transactions.service.ts` — пробросить параметры из DTO в репозиторий.
- [ ] Ручная проверка через curl/REST-клиент: `GET /transactions?limit=10&offset=0` возвращает 10 свежих записей текущего пользователя.

### Shared: типы

- [ ] `packages/shared/src/transactions.ts` (создать) — экспорт `TransactionType` (enum `'income' | 'expense'`), `TransactionDto` (id, amount: string, type, description: string|null, date: string, categoryId, userId, createdAt, updatedAt), `QueryTransactionsParams` (month?, year?, limit?, offset?).
- [ ] `packages/shared/src/categories.ts` (создать) — `CategoryDto` (id, name, color, icon, userId, createdAt, updatedAt).
- [ ] `packages/shared/src/index.ts` — реэкспорт новых модулей.

Примечание: Prisma отдаёт `Decimal` как строку при сериализации в JSON — в DTO держим `amount: string`.

### Фронтенд: feature transactions

- [ ] `apps/web/src/features/transactions/api/transactions.api.ts` — `fetchTransactions(params: QueryTransactionsParams): Promise<TransactionDto[]>` через `shared/api/http.ts`.
- [ ] `apps/web/src/features/transactions/model/store.ts` — Pinia store `useTransactionsStore` с состоянием `recent: TransactionDto[]`, `loading: boolean`, `error: string | null` и action `loadRecent(limit = 10)`.
- [ ] `apps/web/src/features/transactions/index.ts` — публичный экспорт api + store + типы.

### Фронтенд: widget recent-transactions

- [ ] `apps/web/src/widgets/recent-transactions/ui/RecentTransactionsList.vue` — `v-card` с заголовком «Последние транзакции», `v-list` из элементов транзакций (категория-иконка, описание, сумма со знаком по `type`, дата). Состояния loading/empty/error. На монтировании вызывает `transactionsStore.loadRecent(10)`.
- [ ] `apps/web/src/widgets/recent-transactions/index.ts` — экспорт компонента.
- [ ] (Опционально) Простейшие «пред/след» кнопки на основе offset — позже; в этой итерации только последние 10 без UI-пагинатора, т. к. промт говорит «список последних 10 с пагинацией» — оставим место под параметр `limit` в store, кнопки добавим, если потребуется (см. ниже «Открытые вопросы»).

### Фронтенд: layout (app-bar + drawer)

- [ ] `apps/web/src/app/App.vue` — переписать: `v-app` → `v-navigation-drawer` (пункты «Главная», «Транзакции», «Категории» — `router-link`-элементы с иконками mdi) + `v-app-bar` (бургер, заголовок «Трекер расходов», справа `v-menu` с именем пользователя и пунктом «Выйти») + `v-main` → `<router-view />`. Layout показываем только если `authStore.user`, иначе сразу `<router-view />` (страницы login/register без шапки).
- [ ] Кнопка «Выйти» вызывает `authStore.logout()` и `router.push('/login')`.

### Фронтенд: dashboard page и заглушки

- [ ] `apps/web/src/pages/home/ui/HomePage.vue` — переименовать содержимое: заголовок «Главная», приветствие `auth.user.name`, ниже `<RecentTransactionsList />` из widget.
- [ ] `apps/web/src/pages/transactions/ui/TransactionsPage.vue` + `index.ts` — заглушка «Раздел в разработке».
- [ ] `apps/web/src/pages/categories/ui/CategoriesPage.vue` + `index.ts` — заглушка «Раздел в разработке».
- [ ] `apps/web/src/router/index.ts` — добавить маршруты `/transactions` и `/categories` с `meta: { requiresAuth: true }`.

## Критические файлы

Существующие, на которые опираемся:
- `apps/api/src/transactions/dto/query-transactions.dto.ts`, `transactions.repository.ts`, `transactions.service.ts`
- `apps/api/src/auth/auth.controller.ts` — уже есть `GET /auth/me`
- `apps/web/src/features/auth/model/store.ts` — `useAuthStore` (поля `user`, `logout`)
- `apps/web/src/shared/api/http.ts` — axios с Bearer
- `apps/web/src/router/index.ts` — guards и `fetchMe()` при инициализации
- `apps/web/src/app/App.vue` — текущий минимальный layout
- `packages/shared/src/index.ts` — точка экспорта

## Переиспользуем

- `shared/api/http.ts` — единая axios-обёртка, не дублировать.
- `auth.user` из `useAuthStore` — источник имени пользователя; не делать отдельного запроса `/auth/me` в Dashboard.
- Типы из `@app/shared` — все DTO держим там; не дублировать между `apps/web` и `apps/api`.

## Верификация (E2E)

1. `npm run db:up` → `npm run prisma:migrate` (миграций нет, схема не менялась).
2. `npm run dev:api` и `npm run dev:web`.
3. Зарегистрировать пользователя, через REST-клиент создать 1 категорию и 15 транзакций.
4. `curl "http://localhost:$API_PORT/transactions?limit=10&offset=0" -H "Authorization: Bearer …"` → 10 элементов, отсортированы по `date` desc.
5. В браузере залогиниться → видим app-bar, drawer с 3 пунктами, имя пользователя справа, на главной — карточка с 10 последними транзакциями.
6. Клик по «Транзакции»/«Категории» → переход на заглушку. Клик «Выйти» → редирект на `/login`.
7. Проверить guards: открыть `/` в incognito → редирект на `/login`.

## Открытые вопросы (после первого прогона)

- Нужны ли UI-кнопки «следующая/предыдущая страница» прямо в виджете dashboard, или dashboard всегда показывает только первые 10, а полная пагинация — на будущей странице `/transactions`? Сейчас исходим из второго варианта.
- Формат отображения суммы (валюта, локаль) — пока `${type === 'income' ? '+' : '−'}${amount}` без локали.
