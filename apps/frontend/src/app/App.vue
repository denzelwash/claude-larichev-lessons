<script setup lang="ts">
import { useAuthStore } from '@/features/auth';
import SidebarNav from '@/widgets/sidebar';

const auth = useAuthStore();
</script>

<template>
  <v-app>
    <div v-if="auth.user" class="app-shell">
      <SidebarNav />
      <main class="app-main">
        <RouterView />
      </main>
    </div>
    <RouterView v-else />
  </v-app>
</template>
