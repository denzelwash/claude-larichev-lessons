# План: создание транзакции

## Контекст

Главный экран реализован — есть `widgets/recent-transactions`, виджет показывает последние 10 транзакций, но создавать транзакции пока нельзя. Бэкенд уже умеет `POST /transactions` (валидирует `amount`, `date`, `type`, `categoryId`, `description?`) и `GET /categories`. Нужно дать пользователю UI для создания транзакции — без него dashboard остаётся read-only.

Принятые решения (см. диалог):
- Форма — **модальный v-dialog** (без отдельного роута).
- Триггер — **кнопка в заголовке карточки** `RecentTransactionsList` («+ Добавить»).
- Категории — отдельный FSD-слой `features/categories` (api + Pinia store).
- Страница `/transactions` остаётся заглушкой — фокус только на создании.
- Бэкенд **не трогаем**: `POST /transactions` и `GET /categories` готовы.

## Чек-лист задач

### Shared: типы

- [ ] `packages/shared/src/transactions.ts` — добавить `CreateTransactionInput` (`amount: number`, `type: TransactionType`, `description?: string`, `date: string`, `categoryId: string`).

### Фронтенд: features/categories (новый слой)

- [ ] `apps/web/src/features/categories/api/categories.api.ts` — `fetchCategories(): Promise<CategoryDto[]>` через `shared/api/http.ts`.
- [ ] `apps/web/src/features/categories/model/store.ts` — Pinia store `useCategoriesStore` с `items`, `loading`, `error`, action `load()` (ленивая).
- [ ] `apps/web/src/features/categories/index.ts` — публичный экспорт.

### Фронтенд: features/transactions (расширение)

- [ ] `apps/web/src/features/transactions/api/transactions.api.ts` — добавить `createTransaction(input)`.
- [ ] `apps/web/src/features/transactions/model/store.ts` — action `create(input)`: вызывает api, при успехе перезагружает `loadRecent(10)`.
- [ ] `apps/web/src/features/transactions/index.ts` — экспорт `createTransaction`.

### Фронтенд: компонент формы

- [ ] `apps/web/src/features/transactions/ui/TransactionForm.vue` — поля: type (v-btn-toggle), amount (number), categoryId (v-select с иконками), date (type=date), description (textarea). Validation rules, кнопки Отмена/Сохранить. Submit → `transactionsStore.create()` → emit `created`. `onMounted` → `categoriesStore.load()`.

### Фронтенд: интеграция в widget

- [ ] `apps/web/src/widgets/recent-transactions/ui/RecentTransactionsList.vue` — кнопка «+ Добавить» в `v-card-title`, локальный `dialog` ref, `v-dialog` с `<TransactionForm>`.

### Проверка

- [ ] Запустить `npm run dev:api` и `npm run dev:web`.
- [ ] Создать категорию через `POST /categories` (curl/REST).
- [ ] В браузере: dashboard → «+ Добавить» → форма → Сохранить → новая транзакция в списке.
- [ ] Валидация: пустые поля и неверная сумма дают ошибки.
- [ ] Состояние «нет категорий» — alert в форме.

## Критические файлы

Расширяем:
- `packages/shared/src/transactions.ts`
- `apps/web/src/features/transactions/{api/transactions.api.ts,model/store.ts,index.ts}`
- `apps/web/src/widgets/recent-transactions/ui/RecentTransactionsList.vue`

Новые:
- `apps/web/src/features/categories/{api,model}/*` + `index.ts`
- `apps/web/src/features/transactions/ui/TransactionForm.vue`

Не трогаем: бэкенд, App.vue, роутер, заглушки страниц.

## Переиспользуем

- `shared/api/http.ts`.
- `useTransactionsStore.loadRecent()` — после создания перезагружаем список.
- `CategoryDto`, `TransactionDto` из `@app/shared`.
