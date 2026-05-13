<script setup lang="ts">
import { useTransactionsStore } from '@/features/transactions';
import { TransactionForm } from '@/widgets/transaction-form';
import { onMounted, ref } from 'vue';

const store = useTransactionsStore();
const dialog = ref(false);

onMounted(() => store.loadRecent(10));
</script>

<template>
  <v-card elevation="2">
    <v-card-title class="d-flex align-center">
      <span class="text-h6">Последние транзакции</span>
      <v-spacer />
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="dialog = true">
        Добавить
      </v-btn>
    </v-card-title>

    <v-dialog v-model="dialog" max-width="500">
      <TransactionForm :key="String(dialog)" @close="dialog = false" @created="dialog = false" />
    </v-dialog>

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
          <v-icon
            :icon="tx.type === 'income' ? 'mdi-arrow-down-circle' : 'mdi-arrow-up-circle'"
            :color="tx.type === 'income' ? 'success' : 'error'"
          />
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
