<script setup lang="ts">
import { useTransactionsStore } from '@/features/transactions';
import { onMounted } from 'vue';

const store = useTransactionsStore();

onMounted(() => store.loadRecent(10));
</script>

<template>
  <v-card elevation="2">
    <v-card-title class="text-h6">Последние транзакции</v-card-title>

    <v-card-text v-if="store.loading" class="text-center py-6">
      <v-progress-circular indeterminate color="primary" />
    </v-card-text>

    <v-card-text v-else-if="store.error" class="text-error">
      {{ store.error }}
    </v-card-text>

    <v-card-text v-else-if="store.recent.length === 0" class="text-medium-emphasis text-center py-6">
      Транзакций пока нет
    </v-card-text>

    <v-list v-else lines="two" density="compact">
      <v-list-item
        v-for="tx in store.recent"
        :key="tx.id"
        :subtitle="tx.description ?? 'Без описания'"
      >
        <template #prepend>
          <v-icon :color="tx.type === 'income' ? 'success' : 'error'">
            {{ tx.type === 'income' ? 'mdi-arrow-down-circle' : 'mdi-arrow-up-circle' }}
          </v-icon>
        </template>

        <template #title>
          <span :class="tx.type === 'income' ? 'text-success' : 'text-error'" class="font-weight-medium">
            {{ tx.type === 'income' ? '+' : '−' }}{{ tx.amount }}
          </span>
        </template>

        <template #append>
          <span class="text-caption text-medium-emphasis">
            {{ new Date(tx.date).toLocaleDateString('ru-RU') }}
          </span>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>
