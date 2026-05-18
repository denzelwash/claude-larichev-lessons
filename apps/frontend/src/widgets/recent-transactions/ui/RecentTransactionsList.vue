<script setup lang="ts">
import { useTransactionsStore } from '@/features/transactions';
import { onMounted } from 'vue';

const store = useTransactionsStore();

onMounted(() => store.loadRecent(10));
</script>

<template>
  <section class="page-card p-6">
    <h2 class="text-[15px] font-semibold text-ink mb-5">Последние транзакции</h2>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" size="32" />
    </div>

    <!-- Error -->
    <p v-else-if="store.error" class="text-red-500 text-sm text-center py-4">
      {{ store.error }}
    </p>

    <!-- Empty -->
    <div v-else-if="store.recent.length === 0" class="text-center py-10">
      <div class="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
        <v-icon icon="mdi-receipt-text-outline" color="#2563EB" size="24" />
      </div>
      <p class="text-[13px] text-ink-secondary">Транзакций пока нет</p>
    </div>

    <!-- List -->
    <ul v-else class="flex flex-col divide-y divide-slate-100">
      <li
        v-for="tx in store.recent"
        :key="tx.id"
        class="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
      >
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          :class="tx.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'"
        >
          <v-icon
            :icon="tx.type === 'income' ? 'mdi-arrow-down-circle-outline' : 'mdi-arrow-up-circle-outline'"
            :color="tx.type === 'income' ? '#16A34A' : '#DC2626'"
            size="20"
          />
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-semibold text-ink truncate">
            {{ tx.description ?? 'Без описания' }}
          </p>
          <p class="text-[11px] text-ink-muted mt-0.5">
            {{ new Date(tx.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) }}
          </p>
        </div>

        <span
          class="font-display text-[15px] font-semibold flex-shrink-0"
          :class="tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'"
        >
          {{ tx.type === 'income' ? '+' : '−' }}₽{{ Number(tx.amount).toLocaleString('ru-RU') }}
        </span>
      </li>
    </ul>
  </section>
</template>
