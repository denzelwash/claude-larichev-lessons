---
name: commit
description: Правила оформления git-коммитов по Conventional Commits для этого проекта (типы, scopes, формат, breaking changes). Использовать при создании коммита.
model: sonnet
effort: low
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *) Bash(git diff *) Bash(git log *)
---

## Контекст репозитория

- статус: !`git status --short`
- staged diff: !`git diff --staged`
- unstaged diff: !`git diff`
- последние коммиты: !`git log -5 --oneline`

## Правила

Используем [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

Формат: `<type>(<scope>): <description>`

| Тип        | Когда использовать                          |
| ---------- | ------------------------------------------- |
| `feat`     | новая функциональность                      |
| `fix`      | исправление бага                            |
| `refactor` | рефакторинг без изменения поведения         |
| `style`    | форматирование, пробелы, точки с запятой    |
| `test`     | добавление/изменение тестов                 |
| `docs`     | документация                                |
| `chore`    | обслуживание: зависимости, конфиги, скрипты |
| `perf`     | улучшение производительности                |
| `ci`       | изменения CI/CD                             |

Scope — опциональный, указывает на область кода: `backend`, `frontend`, `shared`, `auth`, `prisma`, и т.д.

Примеры:

```
feat(auth): добавить refresh token
fix(backend): исправить CORS при logout
refactor(frontend): перенести логику в Pinia store
chore: обновить зависимости
```

Breaking changes: добавить `!` после type/scope или footer `BREAKING CHANGE:`.

## Алгоритм

1. Изучить блок **Контекст репозитория** выше — статус, diff и историю коммитов он уже содержит.
2. Если staged пусто, а unstaged есть — спросить пользователя, делать ли `git add` или коммитить только staged.
3. Определить `type` по характеру изменений (см. таблицу).
4. Определить `scope`: `backend` / `frontend` / `shared` / `auth` / `prisma` / другое. Если изменения в нескольких workspace — scope можно опустить.
5. Сформулировать `description` — императив, в нижнем регистре, без точки в конце, на русском. Свериться со стилем последних коммитов из контекста.
6. Если есть breaking change — добавить `!` после type/scope.
7. Показать пользователю собранный message и дождаться подтверждения (`git commit` в списке `ask` настроек).
8. После подтверждения — `git commit -m "..."` через HEREDOC.
9. Запустить `git status` — убедиться, что коммит создался.
