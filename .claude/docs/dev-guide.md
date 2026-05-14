# Developer Guide

## Добавить новый backend-модуль

Пример: модуль `budgets`.

### 1. Структура файлов

```
apps/backend/src/budgets/
  dto/
    create-budget.dto.ts
    update-budget.dto.ts
  budgets.controller.ts
  budgets.service.ts
  budgets.repository.ts
  budgets.module.ts
```

### 2. Repository

Только Prisma-запросы, без бизнес-логики. При отсутствии записи возвращать `null`.

```ts
@Injectable()
export class BudgetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, data: CreateBudgetDto) {
    return this.prisma.budget.create({ data: { ...data, userId } });
  }

  findAllByUser(userId: string) {
    return this.prisma.budget.findMany({ where: { userId } });
  }

  findOne(id: string, userId: string) {
    return this.prisma.budget.findFirst({ where: { id, userId } });
  }

  async update(id: string, userId: string, data: UpdateBudgetDto) {
    const existing = await this.prisma.budget.findFirst({ where: { id, userId } });
    if (!existing) return null;
    return this.prisma.budget.update({ where: { id }, data });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.budget.findFirst({ where: { id, userId } });
    if (!existing) return null;
    return this.prisma.budget.delete({ where: { id } });
  }
}
```

### 3. Service

Бизнес-логика: проверка владельца, связанных сущностей, бросание `NotFoundException`.

```ts
@Injectable()
export class BudgetsService {
  constructor(private readonly repository: BudgetsRepository) {}

  async findOne(userId: string, id: string) {
    const budget = await this.repository.findOne(id, userId);
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }
  // ...
}
```

### 4. Controller

Только маршрутизация — извлечь пользователя, вызвать service, добавить Swagger-декораторы.

```ts
@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать бюджет' })
  @ApiResponse({ status: 201, description: 'Бюджет создан.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  create(@CurrentUser() user: PublicUser, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(user.id, dto);
  }
}
```

### 5. DTO

Поля — с `class-validator` и `@ApiProperty`.

```ts
export class CreateBudgetDto {
  @ApiProperty({ example: 50000 })
  @IsNumber()
  @IsPositive()
  limit: number;
}
```

Для update-DTO использовать `PartialType` из `@nestjs/swagger` (не из `@nestjs/mapped-types`):

```ts
import { PartialType } from '@nestjs/swagger';
export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {}
```

### 6. Module

```ts
@Module({
  controllers: [BudgetsController],
  providers: [BudgetsService, BudgetsRepository],
})
export class BudgetsModule {}
```

### 7. Подключить в AppModule

```ts
// apps/backend/src/app.module.ts
import { BudgetsModule } from './budgets/budgets.module';

@Module({
  imports: [..., BudgetsModule],
})
export class AppModule {}
```

---

## Добавить поле в существующую модель (миграция)

1. Обновить `apps/backend/prisma/schema.prisma`.
2. Создать и применить миграцию:
   ```bash
   npm run prisma:migrate
   ```
3. Обновить Prisma Client:
   ```bash
   npm run prisma:generate
   ```
4. Обновить DTO в `apps/backend/src/<module>/dto/`.
5. Если поле нужно на фронте — обновить интерфейс в `packages/shared/src/`.

---

## Добавить новую frontend-фичу (FSD)

Пример: фича `budgets`.

### Структура

```
apps/frontend/src/features/budgets/
  api/
    budgets.api.ts     ← axios-запросы
  model/
    store.ts           ← Pinia store
  index.ts             ← публичный экспорт
```

### API-слой

```ts
// features/budgets/api/budgets.api.ts
import { http } from '@/shared/api/http';

export async function fetchBudgets() {
  const { data } = await http.get('/budgets');
  return data;
}
```

### Pinia Store

```ts
// features/budgets/model/store.ts
export const useBudgetsStore = defineStore('budgets', () => {
  const items = ref([]);

  async function load() {
    items.value = await fetchBudgets();
  }

  return { items, load };
});
```

### Публичный экспорт

```ts
// features/budgets/index.ts
export { useBudgetsStore } from './model/store';
```

### Добавить маршрут

```ts
// apps/frontend/src/router/index.ts
{
  path: '/budgets',
  name: 'budgets',
  component: () => import('@/pages/budgets').then((m) => m.BudgetsPage),
  meta: { requiresAuth: true },
}
```

---

## Добавить общий тип в shared

1. Создать или обновить файл в `packages/shared/src/`:
   ```ts
   // packages/shared/src/budgets.ts
   export interface BudgetDto {
     id: string;
     limit: number;
     userId: string;
   }
   ```
2. Реэкспортировать из `packages/shared/src/index.ts`:
   ```ts
   export * from './budgets';
   ```
3. Импортировать в backend и frontend через `@app/shared`:
   ```ts
   import type { BudgetDto } from '@app/shared';
   ```

---

## Чек-лист перед PR

- [ ] Ветка создана от актуального `main`, название по схеме `<type>/<description>`.
- [ ] DTO содержат `class-validator` + `@ApiProperty`.
- [ ] `UpdateDto` использует `PartialType` из `@nestjs/swagger`.
- [ ] Контроллер защищён `@UseGuards(JwtAuthGuard)` и задокументирован Swagger-декораторами.
- [ ] Новые общие типы добавлены в `packages/shared`, не дублируются.
- [ ] Если менялась схема — миграция создана и закоммичена.
- [ ] FSD-правило импортов не нарушено.
- [ ] Новые маршруты добавлены в роутер (`apps/frontend/src/router/index.ts`).
