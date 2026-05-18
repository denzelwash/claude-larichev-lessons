#!/usr/bin/env bash
# Пре-чек перед созданием PR. Выход с кодом 1 при любой проблеме.
# Использование: bash validate.sh [base-branch]

set -euo pipefail

BASE="${1:-main}"
ERRORS=()

echo "=== validate.sh: проверка ветки перед PR (base: $BASE) ==="
echo ""

# --- Проверка 1: ветка отслеживает remote и не опережает ---
echo "[1/3] Проверка: ветка запушена в remote..."

if ! git rev-parse @{u} &>/dev/null; then
  ERRORS+=("Ветка не отслеживает remote. Выполни: git push -u origin $(git branch --show-current)")
else
  BEHIND=$(git rev-list --count HEAD..@{u} 2>/dev/null || echo 0)
  AHEAD=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo 0)

  if [ "$BEHIND" -gt 0 ]; then
    ERRORS+=("Ветка отстаёт от remote на $BEHIND коммит(а). Выполни: git pull --rebase")
  elif [ "$AHEAD" -gt 0 ]; then
    ERRORS+=("Ветка опережает remote на $AHEAD коммит(а). Выполни: git push")
  else
    echo "    OK — ветка синхронизирована с remote."
  fi
fi

# --- Проверка 2: ветка не отстаёт от origin/<base> ---
echo "[2/3] Проверка: актуальность относительно origin/$BASE..."

git fetch origin "$BASE" --quiet 2>/dev/null || true

BEHIND_BASE=$(git rev-list --count HEAD.."origin/$BASE" 2>/dev/null || echo 0)

if [ "$BEHIND_BASE" -gt 0 ]; then
  ERRORS+=("Ветка отстаёт от origin/$BASE на $BEHIND_BASE коммит(а). Выполни rebase: git rebase origin/$BASE")
else
  echo "    OK — ветка актуальна относительно origin/$BASE."
fi

# --- Проверка 3: нет случайных файлов в diff ---
echo "[3/3] Проверка: нет случайных файлов в diff..."

DIRTY_FILES=$(git diff "origin/$BASE"...HEAD --name-only 2>/dev/null | grep -E '(^|/)\.env(\.|$)|(^|/)dist/|(^|/)build/|\.sqlite$|\.dump$|\.sql$' || true)

if [ -n "$DIRTY_FILES" ]; then
  ERRORS+=("В diff найдены нежелательные файлы:
$(echo "$DIRTY_FILES" | sed 's/^/    - /')")
else
  echo "    OK — случайных файлов не найдено."
fi

# --- Итог ---
echo ""
if [ ${#ERRORS[@]} -eq 0 ]; then
  echo "=== Все проверки пройдены. Можно создавать PR. ==="
  exit 0
else
  echo "=== ОШИБКИ (${#ERRORS[@]}) — PR создавать нельзя: ==="
  for err in "${ERRORS[@]}"; do
    echo ""
    echo "  ✗ $err"
  done
  echo ""
  exit 1
fi
