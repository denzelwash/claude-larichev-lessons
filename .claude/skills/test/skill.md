---
name: test
description: Генерация unit-тестов для файла, переданного аргументом. Создаёт *.spec.ts рядом с исходником и запускает раннер нужного workspace. Jest — для backend, Vitest — для frontend. Использовать, когда нужно покрыть тестами конкретный модуль.
model: sonnet
effort: medium
disable-model-invocation: true
allowed-tools: Read Write Edit Glob Grep Bash(npm -w *) Bash(npx jest*) Bash(npx vitest*)
argument-hint: '<file-path>'
---

## Параметры

| Параметр    | Пример                                        | Обязательный |
| ----------- | --------------------------------------------- | ------------ |
| `file-path` | `/test apps/backend/src/auth/auth.service.ts` | да           |

Путь — относительный от корня репозитория.

## Правила

- Тесты пишутся в `<basename>.spec.ts` рядом с исходным файлом.
- **Backend** (`apps/backend/**`) — Jest + `@nestjs/testing`. Все внешние зависимости (сервисы, репозитории, PrismaService) мокируются через `jest.fn()`. NestJS-модуль собирается через `Test.createTestingModule`.
- **Frontend** (`apps/frontend/**`, `.ts`) — Vitest. Pinia-сторы тестируются с `setActivePinia(createPinia())`.
- **Frontend** (`apps/frontend/**`, `.vue`) — Vitest + `@vue/test-utils` (`mount`/`shallowMount`).
- Покрывать: happy path, граничные случаи, обработку ошибок.
- Типы импортировать из `@app/shared`, не дублировать.
- Не запускать тесты в watch-режиме.
- Исходный файл не менять без явной просьбы.

## Шаблоны

### Jest + NestJS (backend)

```ts
import { Test, TestingModule } from '@nestjs/testing'
import { MyService } from './my.service'
import { SomeDep } from '../some/some.service'

describe('MyService', () => {
	let service: MyService
	let dep: jest.Mocked<SomeDep>

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [MyService, { provide: SomeDep, useValue: { method: jest.fn() } }]
		}).compile()

		service = module.get<MyService>(MyService)
		dep = module.get(SomeDep)
	})

	describe('methodName', () => {
		it('возвращает результат при корректных данных', async () => {
			dep.method.mockResolvedValue('value')
			await expect(service.methodName('input')).resolves.toBe('value')
		})

		it('бросает ошибку при некорректных данных', async () => {
			dep.method.mockRejectedValue(new Error('fail'))
			await expect(service.methodName('bad')).rejects.toThrow('fail')
		})
	})
})
```

### Vitest (frontend, `.ts`-стор/утилита)

```ts
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMyStore } from './my.store'

describe('useMyStore', () => {
	beforeEach(() => {
		setActivePinia(createPinia())
	})

	it('начальное состояние корректно', () => {
		const store = useMyStore()
		expect(store.value).toBeNull()
	})

	it('action изменяет состояние', async () => {
		const store = useMyStore()
		await store.doAction()
		expect(store.value).toBe('result')
	})
})
```

## Алгоритм

1. Прочитать аргумент — путь к файлу. Если не передан — спросить пользователя.
2. Определить workspace:
   - путь начинается с `apps/backend/` → **Jest**.
   - путь начинается с `apps/frontend/` → **Vitest**.
   - иначе — остановиться и уточнить у пользователя.
3. Прочитать целевой файл. При необходимости прочитать связанные файлы (импортируемые зависимости, типы из `@app/shared`).
4. Составить список тест-кейсов (happy path, граничные случаи, ошибки), показать пользователю и дождаться подтверждения или правок.
5. Сгенерировать `<basename>.spec.ts` рядом с исходником, используя подходящий шаблон.
6. Запустить тесты:
   - backend: `npm -w apps/backend run test -- --testPathPattern=<spec-filename>`
   - frontend: `npm -w apps/frontend run test -- <path-to-spec>`
7. Если тесты красные — исправить тест или мок, перезапустить. Исходный файл не трогать без явной просьбы.
8. Сообщить итог: путь к созданной спеке, число passed/failed.
