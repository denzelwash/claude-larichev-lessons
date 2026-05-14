<script setup lang="ts">
import { useAuthStore } from '@/features/auth';
import { RecentTransactionsList } from '@/widgets/recent-transactions';

const auth = useAuthStore();
</script>

<template>
  <div>
    <h1 class="text-h5 mb-1">Expense Tracker</h1>
    <p v-if="auth.user" class="text-medium-emphasis mb-6">Привет, {{ auth.user.name }}!</p>
    <RecentTransactionsList />
  </div>
</template>
