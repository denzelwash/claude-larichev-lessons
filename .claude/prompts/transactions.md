# Новая функциональность

- Создать модуль транзакций

## Контекст (что уже есть)

- NestJS + Vue.js + PostgreSQL + Prisma
- Авторизация (JWT), модуль категорий

## Задача

Центральный модуль учёта доходов и расходов.

## Модель данных

Транзакция: id, amount, type (income/expense), description, date, categoryId, userId, createdAt

## Контроллер

POST /transactions, GET /transactions (агрегация по month/year),
GET /transactions/:id, PATCH /transactions/:id, DELETE /transactions/:id
