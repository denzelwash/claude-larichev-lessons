---
name: pr
description: Шаблон Pull Request для этого проекта — заголовок, обязательные разделы описания, пре-чек перед созданием PR. Использовать при создании PR через gh pr create.
model: sonnet
effort: low
disable-model-invocation: true
allowed-tools: Bash(gh pr *) Bash(gh api *) Bash(git push *) Bash(git status *) Bash(git diff *) Bash(git log *) Bash(git fetch *) Bash(git branch *) Bash(bash .claude/skills/pr/scripts/validate.sh *)
argument-hint: "<title> <base-branch, default main>"
---

## Параметры

| Параметр | Пример | По умолчанию |
| -------- | ------ | ------------ |
| `title` | `/pr "feat: add auth"` | генерируется автоматически |
| `base-branch` | `/pr "" develop` | `main` |

Пример: `/pr "feat(auth): добавить refresh token" develop`

## Контекст ветки

- текущая ветка: !`git branch --show-current`
- статус: !`git status --short`
- diff stat относительно main: !`git diff main...HEAD --stat`
- коммиты в ветке: !`git log main..HEAD --oneline`

## Алгоритм

1. Определить `title` и `base-branch` из аргументов скилла.
2. Запустить `bash .claude/skills/pr/scripts/validate.sh <base-branch>`. При ошибке — остановиться.
3. Собрать тело PR по шаблону из `template.md` (правила включения секций — в `reference.md`).
4. Показать пользователю заголовок и тело, дождаться подтверждения.
5. Создать PR: `gh pr create --base <base-branch> --title "..." --body "..."`, вернуть URL.

## Вспомогательные файлы

| Файл | Назначение |
|------|------------|
| `template.md` | шаблон тела PR с плейсхолдерами |
| `reference.md` | правила заголовка, секций, полный алгоритм |
| `examples/feat.pr.md` | пример feat-PR с бэк+фронт изменениями |
| `examples/chore.pr.md` | пример chore-PR без чек-листа ревью |
| `scripts/validate.sh` | авто-проверки перед созданием PR |
