# Авторизация в API: Users + Auth через CQRS

## Context

В `apps/api` сейчас только `AppModule`, `PrismaModule` и health-эндпоинт. Prisma-схема пуста (плейсхолдер), миграций нет, в `packages/shared` нет типов. Авторизация явно отложена до отдельной задачи (`CLAUDE.md` запрещает заглушку `User` без согласования) — это и есть та задача.

Цель — ввести модель пользователя (имя, email, хэш пароля), модуль авторизации с JWT (`register`, `login`, `me`) и связать модули через `@nestjs/cqrs`, чтобы `AuthModule` не импортировал сервисы `UsersModule` напрямую. Это закладывает фундамент для будущих модулей расходов/категорий, которые тоже будут общаться с `Users` через шину команд/запросов.

## Статус: ✅ Выполнено (07.05.2026)

Все задачи реализованы и проверены автоматически. Единственное ручное действие — добавить переменные в `.env` / `.env.example` (файлы недоступны из-за настроек прав):

```
JWT_SECRET=change-me-in-prod
JWT_EXPIRES_IN=15m
```

## Чек-лист задач

### 1. Зависимости
- [x] В `apps/api` поставить: `@nestjs/cqrs`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `@node-rs/bcrypt`, `class-validator`, `class-transformer`
- [x] В `apps/api` (dev): `@types/passport-jwt`
- [x] `npm install` в корне

### 2. Env
- [x] Добавить `JWT_SECRET` и `JWT_EXPIRES_IN=15m` в `.env.example` и `.env` ⚠️ сделать вручную (файлы недоступны из-за настроек прав)

### 3. Prisma
- [x] В `apps/api/prisma/schema.prisma` добавить модель `User` (id cuid, email unique, name, passwordHash, createdAt, updatedAt)
- [x] `npm run db:up`
- [x] `npm run prisma:migrate -- --name init_user`
- [x] `npm run prisma:generate`

### 4. Shared (`packages/shared/src`)
- [x] Файл `auth.ts` с типами `PublicUser`, `JwtPayload`, `AuthResponseDto`
- [x] Реэкспорт из `index.ts`

### 5. UsersModule (`apps/api/src/users/`)
- [x] `users.repository.ts` — обёртка над `PrismaService` (`create`, `findByEmail`, `findById`)
- [x] `cqrs/commands/create-user.command.ts` + `create-user.handler.ts` (ловит `P2002` → `ConflictException`)
- [x] `cqrs/queries/find-user-by-id.query.ts` + handler
- [x] `cqrs/queries/validate-credentials.query.ts` + handler (внутри хэндлера `bcrypt.verify`)
- [x] `users.module.ts` — `imports: [CqrsModule]`, в `providers` все три хэндлера + репозиторий, **без `exports`**

### 6. AuthModule (`apps/api/src/auth/`)
- [x] `dto/register.dto.ts` (`name`, `email`, `password` — `class-validator`)
- [x] `dto/login.dto.ts`
- [x] `strategies/jwt.strategy.ts` — `validate` диспатчит `FindUserByIdQuery` через `QueryBus`
- [x] `guards/jwt-auth.guard.ts` — `extends AuthGuard('jwt')`
- [x] `decorators/current-user.decorator.ts` — параметр-декоратор для `req.user`
- [x] `auth.service.ts`:
  - [x] `register`: `bcrypt.hash` → `commandBus.execute(CreateUserCommand)` → `jwtService.sign`
  - [x] `login`: `queryBus.execute(ValidateCredentialsQuery)` → если `null` → `UnauthorizedException`, иначе `sign`
- [x] `auth.controller.ts`:
  - [x] `POST /auth/register`
  - [x] `POST /auth/login`
  - [x] `GET /auth/me` под `JwtAuthGuard`, возвращает `@CurrentUser()`
- [x] `auth.module.ts` — `imports: [CqrsModule, PassportModule, JwtModule.registerAsync]`, `exports: [JwtAuthGuard]`, **без импорта `UsersModule`**

### 7. Подключение
- [x] `app.module.ts`: добавить `UsersModule`, `AuthModule`
- [x] `main.ts`: глобальный `ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })`

### 8. Верификация ✅ все прошли
- [x] `npm run dev:api` стартует без ошибок
- [x] `POST /auth/register` с валидным телом → `{ accessToken }`
- [x] Повторный `register` с тем же email → `409`
- [x] `POST /auth/login` правильный пароль → `{ accessToken }`
- [x] `POST /auth/login` неверный пароль → `401`
- [x] `POST /auth/register` с `password: "123"` → `400`
- [x] `GET /auth/me` с Bearer → `{ id, email, name }`
- [x] `GET /auth/me` без токена → `401`

---

## Зависимости (детально)

- `@nestjs/cqrs` — командная шина
- `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`
- `@types/passport-jwt` (dev)
- `@node-rs/bcrypt` — хэш паролей (без node-gyp, ставится на Windows)
- `class-validator`, `class-transformer` — валидация DTO

## Prisma

`apps/api/prisma/schema.prisma`:

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## Структура новых файлов

```
apps/api/src/
├── app.module.ts                       (modify: + UsersModule, AuthModule)
├── main.ts                             (modify: + ValidationPipe)
├── users/
│   ├── users.module.ts
│   ├── users.repository.ts
│   └── cqrs/
│       ├── commands/
│       │   ├── create-user.command.ts
│       │   └── create-user.handler.ts
│       └── queries/
│           ├── find-user-by-id.query.ts
│           ├── find-user-by-id.handler.ts
│           ├── validate-credentials.query.ts
│           └── validate-credentials.handler.ts
└── auth/
    ├── auth.module.ts
    ├── auth.controller.ts
    ├── auth.service.ts
    ├── dto/{register,login}.dto.ts
    ├── strategies/jwt.strategy.ts
    ├── guards/jwt-auth.guard.ts
    └── decorators/current-user.decorator.ts

packages/shared/src/
├── index.ts                            (modify: re-export)
└── auth.ts                             (PublicUser, JwtPayload, AuthResponseDto)
```

## Взаимодействие модулей через CQRS

### Принцип

`AuthModule` НЕ импортирует ни `UsersModule`, ни `UsersRepository`, ни сервисы `Users` в свой `providers`. Единственный способ обратиться к Users — отправить команду или запрос в шину `@nestjs/cqrs`. `UsersModule` не экспортирует ничего наружу: его обработчики регистрируются в `providers` и автоматически подхватываются `CqrsModule` через `ExplorerService`.

`CqrsModule` импортируется отдельно в `UsersModule` и `AuthModule`. Это глобально доступная шина (один `CommandBus`/`QueryBus` на всё приложение), но зависимостной связи между модулями не возникает — Nest DI видит только `CommandBus`, не сам `Users`.

### Контракт

| Тип | Класс | Вход (payload) | Выход | Кто шлёт | Кто обрабатывает |
| --- | --- | --- | --- | --- | --- |
| Command | `CreateUserCommand` | `{ name, email, passwordHash }` | `PublicUser`; `ConflictException` при дубликате email | `AuthService.register` | `CreateUserHandler` (Users) |
| Query | `ValidateCredentialsQuery` | `{ email, password }` | `PublicUser \| null` | `AuthService.login` | `ValidateCredentialsHandler` (Users) |
| Query | `FindUserByIdQuery` | `{ id }` | `PublicUser \| null` | `JwtStrategy.validate` | `FindUserByIdHandler` (Users) |

Все три класса лежат в `apps/api/src/users/cqrs/...` — это нормально: классы команд/запросов принадлежат стороне, которая их обрабатывает (Users владеет своим контрактом). `AuthModule` импортирует ИХ, но не сам `UsersModule`.

`PublicUser = { id, email, name }` — общий тип в `@app/shared`. Хэш пароля никогда не покидает `UsersModule`.

### Зачем именно так

- **Хэширование (политика стойкости) живёт в `Auth`**, хранение — в `Users`. `register` хэширует через `@node-rs/bcrypt` САМ и передаёт уже готовый `passwordHash` командой — `Users` ничего не знает про bcrypt.
- **Plain-пароль и хэш не пересекают границу одновременно.** В `login` `Auth` отдаёт plain-пароль внутрь `Users` через `ValidateCredentialsQuery`; обратно возвращается только публичный профиль либо `null`. Хэш не утекает наружу.
- **Расширяемость.** Когда появятся `Expenses`/`Categories`, они будут общаться с `Users` ровно так же — через `FindUserByIdQuery` и потенциальные новые команды. Контракт уже задан.

### Поток вызовов

**Register (`POST /auth/register`):**

```
Controller
  → AuthService.register(dto)
      → bcrypt.hash(dto.password)                              [внутри Auth]
      → commandBus.execute(new CreateUserCommand(name, email, hash))
            → CreateUserHandler.execute(cmd)                    [внутри Users]
                → UsersRepository.create(...)                   [PrismaService]
                → catch P2002 → throw ConflictException
                → return PublicUser
      ← PublicUser
      → jwtService.sign({ sub: user.id, email: user.email })   [внутри Auth]
      → return { accessToken }
```

**Login (`POST /auth/login`):**

```
Controller
  → AuthService.login(dto)
      → queryBus.execute(new ValidateCredentialsQuery(email, password))
            → ValidateCredentialsHandler.execute(q)             [внутри Users]
                → UsersRepository.findByEmail(email)
                → if !user: return null
                → bcrypt.verify(password, user.passwordHash)     ← хэш остаётся внутри Users
                → return ok ? PublicUser : null
      ← PublicUser | null
      → if null: throw UnauthorizedException                   [внутри Auth]
      → jwtService.sign(...)
      → return { accessToken }
```

> Замечание: `bcrypt.verify` оказался ВНУТРИ Users сознательно — чтобы хэш не уходил в Auth. Сама библиотека `@node-rs/bcrypt` стоит как зависимость `apps/api` и доступна обоим, но политика «как сравнивать» инкапсулирована в Users рядом с хранилищем.

**Защищённый запрос (`GET /auth/me`):**

```
Request с Bearer JWT
  → JwtAuthGuard
      → JwtStrategy.validate(payload)                          [внутри Auth]
          → queryBus.execute(new FindUserByIdQuery(payload.sub))
                → FindUserByIdHandler                           [внутри Users]
                    → UsersRepository.findById(...)
                    → return PublicUser | null
          ← PublicUser | null
          → if null: throw UnauthorizedException
          → return PublicUser            ← попадёт в req.user
  → AuthController.me(@CurrentUser() user) → user
```

### Регистрация хэндлеров

```ts
// apps/api/src/users/users.module.ts
@Module({
  imports: [CqrsModule],
  providers: [
    UsersRepository,
    CreateUserHandler,
    ValidateCredentialsHandler,
    FindUserByIdHandler,
  ],
})
export class UsersModule {}

// apps/api/src/auth/auth.module.ts
@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({ /* secret из ConfigService */ }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtAuthGuard],   // чтобы будущие модули могли защищать свои роуты
})
export class AuthModule {}
```

Пример хэндлера:

```ts
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, PublicUser> {
  constructor(private readonly users: UsersRepository) {}
  async execute(cmd: CreateUserCommand): Promise<PublicUser> {
    try {
      const u = await this.users.create(cmd);
      return { id: u.id, email: u.email, name: u.name };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw e;
    }
  }
}
```

## Эндпоинты

| Метод | Путь | Тело | Ответ |
| --- | --- | --- | --- |
| POST | `/auth/register` | `{ name, email, password }` | `{ accessToken: string }` |
| POST | `/auth/login` | `{ email, password }` | `{ accessToken: string }` |
| GET | `/auth/me` | — (Bearer JWT) | `PublicUser` |

JWT payload: `{ sub: userId, email }`.

## Env

```
JWT_SECRET=change-me-in-prod
JWT_EXPIRES_IN=15m
```

## Верификация (детально)

1. `npm install` в корне.
2. `npm run db:up`.
3. `npm run prisma:migrate -- --name init_user`.
4. `npm run dev:api`.
5. PowerShell (`Invoke-RestMethod` / `curl.exe`):
   - `POST /auth/register` `{ "name":"Den","email":"d@e.com","password":"qwerty12" }` → `{ accessToken }`
   - Повтор → `409`
   - `POST /auth/login` те же креды → `{ accessToken }`
   - `POST /auth/login` неверный пароль → `401`
   - `GET /auth/me` `Authorization: Bearer <t>` → `{ id, email, name }`
   - без токена → `401`
   - `password:"123"` при register → `400`
6. `npm -w apps/api run prisma:studio` — запись c `passwordHash` (`$2...`).
