<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth';

const auth = useAuthStore();
const router = useRouter();

function onLogout() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <v-container>
    <v-card elevation="2">
      <v-card-title class="text-h5">Expense Tracker</v-card-title>
      <v-card-subtitle v-if="auth.user">Привет, {{ auth.user.name }}!</v-card-subtitle>
      <v-card-text class="text-medium-emphasis">
        Здесь будет список расходов.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="error" variant="tonal" @click="onLogout">Выйти</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
