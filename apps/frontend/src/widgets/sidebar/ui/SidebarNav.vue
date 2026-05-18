<script setup lang="ts">
import { useAuthStore } from '@/features/auth';
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const navItems = [
  { title: 'Дашборд', icon: 'mdi-view-dashboard-outline', name: 'home' },
  { title: 'Транзакции', icon: 'mdi-swap-horizontal', name: 'transactions' },
  { title: 'Категории', icon: 'mdi-tag-multiple-outline', name: 'categories' },
];

const userInitials = computed(() => {
  const name = auth.user?.name ?? '';
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
});

function isActive(name: string) {
  return route.name === name;
}

function onLogout() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="flex items-center gap-3 mb-8 px-2">
      <div
        class="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0"
      >
        <v-icon icon="mdi-wallet-outline" color="white" size="22" />
      </div>
      <span class="font-semibold text-[15px] text-ink leading-tight">
        Expense<br />Tracker
      </span>
    </div>

    <!-- User profile -->
    <div class="flex items-center gap-3 mb-7 px-2">
      <div
        class="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0"
      >
        <span class="text-brand-600 font-semibold text-xs">{{ userInitials }}</span>
      </div>
      <div class="min-w-0">
        <p class="text-[13px] font-semibold text-ink truncate leading-tight">
          {{ auth.user?.name }}
        </p>
        <p class="text-[11px] text-ink-muted truncate leading-tight mt-0.5">
          {{ auth.user?.email }}
        </p>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex flex-col gap-1 flex-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="nav-item"
        :class="{ 'nav-item--active': isActive(item.name) }"
      >
        <v-icon :icon="item.icon" size="20" />
        <span>{{ item.title }}</span>
      </RouterLink>

      <!-- Настройки — disabled placeholder -->
      <div class="nav-item nav-item--disabled" role="menuitem" aria-disabled="true">
        <v-icon icon="mdi-cog-outline" size="20" />
        <span>Настройки</span>
      </div>
    </nav>

    <!-- Logout -->
    <button class="nav-item nav-item--logout mt-4" @click="onLogout">
      <v-icon icon="mdi-logout" size="20" />
      <span>Выйти</span>
    </button>
  </aside>
</template>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}

.nav-item:hover:not(.nav-item--disabled):not(.nav-item--logout) {
  background: #eff6ff;
  color: #2563eb;
}

.nav-item--active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

.nav-item--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-item--logout:hover {
  background: #fff1f2;
  color: #dc2626;
}
</style>
