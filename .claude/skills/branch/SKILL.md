---
name: branch
description: Именование веток и работа по GitHub Flow в этом репозитории. Использовать при создании новой ветки.
model: sonnet
effort: low
allowed-tools: Bash(git checkout *) Bash(git branch *) Bash(git fetch *) Bash(git pull *) Bash(git status *)
---

Работаем по [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow):

1. `main` — всегда стабильная ветка; прямые коммиты запрещены.
2. Каждая фича/фикс — отдельная ветка от `main`.
3. Именование веток: `<type>/<short-description>` (те же типы, что в Conventional Commits).
   - Примеры: `feat/dashboard`, `fix/auth-cors`, `refactor/pinia-store`
4. После завершения работы — Pull Request в `main`; мёрж только после review.
5. После мёржа ветка удаляется.

## Алгоритм

1. Уточнить у пользователя характер задачи, если непонятно — это фича, фикс, рефакторинг и т.д.
2. Подобрать `type` из таблицы Conventional Commits: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`, `perf`, `ci`.
3. Сформировать короткое kebab-case описание (2–4 слова, на английском, без артиклей).
4. Собрать имя: `<type>/<short-description>` — например, `feat/refresh-token`, `fix/auth-cors`.
5. Убедиться, что текущая ветка — актуальный `main`: `git status`, `git fetch`, `git pull`.
6. Создать ветку: `git checkout -b <type>/<short-description>`.
7. Показать пользователю результат `git branch --show-current`.
