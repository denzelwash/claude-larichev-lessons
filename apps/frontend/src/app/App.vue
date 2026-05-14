<script setup lang="ts">
import { useAuthStore } from '@/features/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const drawer = ref(true);

const navItems = [
  { title: 'Главная', icon: 'mdi-home', to: '/' },
  { title: 'Транзакции', icon: 'mdi-swap-horizontal', to: '/transactions' },
  { title: 'Категории', icon: 'mdi-tag-multiple', to: '/categories' },
];

function onLogout() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <v-app>
    <template v-if="auth.user">
      <v-navigation-drawer v-model="drawer">
        <v-list-item title="Трекер расходов" nav class="py-4" />
        <v-divider />
        <v-list density="compact" nav>
          <v-list-item
            v-for="item in navItems"
            :key="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.to"
            active-color="primary"
          />
        </v-list>
      </v-navigation-drawer>

      <v-app-bar elevation="1">
        <v-app-bar-nav-icon @click="drawer = !drawer" />
        <v-app-bar-title>Трекер расходов</v-app-bar-title>
        <v-spacer />
        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="text" :append-icon="'mdi-chevron-down'">
              {{ auth.user.name }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item prepend-icon="mdi-logout" title="Выйти" @click="onLogout" />
          </v-list>
        </v-menu>
      </v-app-bar>
    </template>

    <v-main>
      <v-container>
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>
