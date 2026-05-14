# База данных

PostgreSQL 16. ORM — Prisma. Схема: `apps/backend/prisma/schema.prisma`.

---

## Модели

### `User`

Пользователь системы.

| Поле | Тип | Описание |
|---|---|---|
| `id` | `String` (cuid) | первичный ключ, генерируется автоматически |
| `email` | `String` | уникальный, используется для входа |
| `name` | `String` | отображаемое имя |
| `passwordHash` | `String` | bcrypt-хеш пароля, никогда не возвращается в API |
| `createdAt` | `DateTime` | устанавливается автоматически |
| `updatedAt` | `DateTime` | обновляется автоматически |
| `categories` | `Category[]` | связь one-to-many |
| `transactions` | `Transaction[]` | связь one-to-many |

---

### `Category`

Категория расходов/доходов, принадлежит конкретному пользователю.

| Поле | Тип | Описание |
|---|---|---|
| `id` | `String` (cuid) | первичный ключ |
| `name` | `String` | название категории, max 64 символа |
| `color` | `String` | HEX-цвет `#RRGGBB` для отображения в UI |
| `icon` | `String` | идентификатор иконки, max 64 символа |
| `userId` | `String` | внешний ключ → `User.id` |
| `user` | `User` | relation, `onDelete: Cascade` |
| `transactions` | `Transaction[]` | связь one-to-many |
| `createdAt` | `DateTime` | устанавливается автоматически |
| `updatedAt` | `DateTime` | обновляется автоматически |

**Индексы:** `@@index([userId])`

---

### `Transaction`

Финансовая операция (расход или доход).

| Поле | Тип | Описание |
|---|---|---|
| `id` | `String` (cuid) | первичный ключ |
| `amount` | `Decimal(12, 2)` | сумма; хранится как Decimal, в API возвращается как строка |
| `type` | `TransactionType` | `income` или `expense` |
| `description` | `String?` | необязательное описание, max 255 символов |
| `date` | `DateTime` | дата операции (задаётся пользователем, не автоматическая) |
| `categoryId` | `String` | внешний ключ → `Category.id` |
| `userId` | `String` | внешний ключ → `User.id` |
| `category` | `Category` | relation, `onDelete: Cascade` |
| `user` | `User` | relation, `onDelete: Cascade` |
| `createdAt` | `DateTime` | устанавливается автоматически |
| `updatedAt` | `DateTime` | обновляется автоматически |

**Индексы:**
- `@@index([userId])` — быстрый поиск транзакций пользователя.
- `@@index([categoryId])` — быстрый поиск транзакций по категории.
- `@@index([userId, date])` — фильтрация по периоду (используется в `findAllByUser` с `range`).

---

## Enum

```prisma
enum TransactionType {
  income
  expense
}
```

Значения lowercase — `income` / `expense`. В TypeScript использовать `TransactionType.income` / `TransactionType.expense`.

---

## Каскадное удаление

- Удаление `User` → удаляет все его `Category` и `Transaction`.
- Удаление `Category` → удаляет все связанные `Transaction`.

---

## Работа с миграциями

```bash
# Создать и применить миграцию после изменения schema.prisma
npm run prisma:migrate

# Обновить Prisma Client
npm run prisma:generate

# Открыть Prisma Studio
npm -w apps/backend run prisma:studio
```

Файлы миграций хранятся в `apps/backend/prisma/migrations/` и коммитятся в репозиторий.
