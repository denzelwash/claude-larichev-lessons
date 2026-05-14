# API Reference

Base URL: `http://localhost:3000` (порт из `API_PORT`).  
Swagger UI: `http://localhost:3000/api/docs` (только в режиме разработки).

Защищённые эндпоинты требуют заголовка:
```
Authorization: Bearer <access_token>
```

---

## Health

### `GET /health`
Проверка работоспособности сервера.

**Response 200**
```json
{ "status": "ok" }
```

---

## Auth

### `POST /auth/register`
Регистрация нового пользователя.

**Body**
```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "strongpass123"
}
```

| Поле | Тип | Ограничения |
|---|---|---|
| `name` | string | обязательное |
| `email` | string | валидный email |
| `password` | string | минимум 8 символов |

**Response 201**
```json
{ "accessToken": "<jwt>" }
```

**Ошибки:** `400` — невалидные данные, `409` — email уже занят.

---

### `POST /auth/login`
Вход в систему.

**Body**
```json
{
  "email": "ivan@example.com",
  "password": "strongpass123"
}
```

**Response 200**
```json
{ "accessToken": "<jwt>" }
```

**Ошибки:** `400` — невалидные данные, `401` — неверный email или пароль.

---

### `GET /auth/me` 🔒
Получить данные текущего пользователя.

**Response 200**
```json
{
  "id": "clx1y2z3a0000abc123",
  "email": "ivan@example.com",
  "name": "Иван Иванов"
}
```

**Ошибки:** `401` — не аутентифицирован.

---

## Categories 🔒

Все эндпоинты требуют авторизации. Пользователь видит и управляет только своими категориями.

### `POST /categories`
Создать категорию.

**Body**
```json
{
  "name": "Продукты",
  "color": "#FF5733",
  "icon": "shopping-cart"
}
```

| Поле | Тип | Ограничения |
|---|---|---|
| `name` | string | max 64 символа |
| `color` | string | HEX-цвет `#RRGGBB` |
| `icon` | string | max 64 символа |

**Response 201** — объект `CategoryDto`.

**Ошибки:** `400`, `401`.

---

### `GET /categories`
Список всех категорий пользователя (сортировка по `createdAt` desc).

**Response 200** — массив `CategoryDto`.

---

### `GET /categories/:id`
Получить категорию по ID.

**Response 200** — объект `CategoryDto`.

**Ошибки:** `401`, `404`.

---

### `PATCH /categories/:id`
Частичное обновление категории. Все поля необязательны.

**Body** — любое подмножество полей `CreateCategoryDto`.

**Response 200** — обновлённый объект `CategoryDto`.

**Ошибки:** `400`, `401`, `404`.

---

### `DELETE /categories/:id`
Удалить категорию. Каскадно удаляет связанные транзакции.

**Response 200** — удалённый объект `CategoryDto`.

**Ошибки:** `401`, `404`.

---

## Transactions 🔒

Все эндпоинты требуют авторизации. Пользователь видит и управляет только своими транзакциями.

### `POST /transactions`
Создать транзакцию.

**Body**
```json
{
  "amount": 1500,
  "type": "expense",
  "description": "Покупка в супермаркете",
  "date": "2024-01-15",
  "categoryId": "clx1y2z3a0000abc123"
}
```

| Поле | Тип | Ограничения |
|---|---|---|
| `amount` | number | положительное число |
| `type` | `"income"` \| `"expense"` | enum |
| `description` | string? | max 255 символов |
| `date` | string | ISO 8601 |
| `categoryId` | string | должна принадлежать пользователю |

**Response 201** — объект `TransactionDto`.

**Ошибки:** `400`, `401`, `404` (категория не найдена).

---

### `GET /transactions`
Список транзакций с фильтрацией и пагинацией.

**Query-параметры**

| Параметр | Тип | Описание |
|---|---|---|
| `month` | number (1–12) | месяц фильтрации |
| `year` | number (≥ 1970) | год фильтрации |
| `limit` | number (1–100) | лимит записей |
| `offset` | number (≥ 0) | смещение |

`month` и `year` работают только в паре — если задан только один, фильтр по дате не применяется.

**Response 200** — массив `TransactionDto` (сортировка по `date` desc).

---

### `GET /transactions/:id`
Получить транзакцию по ID.

**Response 200** — объект `TransactionDto`.

**Ошибки:** `401`, `404`.

---

### `PATCH /transactions/:id`
Частичное обновление транзакции. Все поля необязательны.

**Response 200** — обновлённый объект `TransactionDto`.

**Ошибки:** `400`, `401`, `404` (транзакция или категория не найдена).

---

### `DELETE /transactions/:id`
Удалить транзакцию.

**Response 204** — пустое тело.

**Ошибки:** `401`, `404`.

---

## Типы ответов

### `CategoryDto`
```ts
{
  id: string;
  name: string;
  color: string;        // #RRGGBB
  icon: string;
  userId: string;
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
}
```

### `TransactionDto`
```ts
{
  id: string;
  amount: string;       // Decimal как строка
  type: 'income' | 'expense';
  description: string | null;
  date: string;         // ISO 8601
  categoryId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
```
