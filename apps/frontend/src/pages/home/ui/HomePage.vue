<script setup lang="ts">
import { ref } from 'vue';
import { PageHeader } from '@/shared/ui';
import { StatCard, SpendingTrendChart, CategoryDonut, mockSummary } from '@/widgets/dashboard';
import { RecentTransactionsList } from '@/widgets/recent-transactions';
import { TransactionForm } from '@/features/transactions';

const dialog = ref(false);

const summary = mockSummary;
</script>

<template>
  <div>
    <PageHeader title="Дашборд">
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          class="rounded-full text-capitalize"
          style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 13px;"
          @click="dialog = true"
        >
          Добавить расход
        </v-btn>
      </template>
    </PageHeader>

    <!-- Stat cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      <StatCard
        label="Расходы за месяц"
        :value="`₽${summary.totalMonthlySpend.toLocaleString('ru-RU')}`"
        :delta="summary.spendingDelta"
      />
      <StatCard
        label="Категорий"
        :value="String(summary.totalCategories)"
      />
      <StatCard
        label="Транзакций"
        :value="String(summary.totalTransactions)"
        :delta="summary.transactionsDelta"
      />
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
      <div class="lg:col-span-3">
        <SpendingTrendChart :data="summary.spendingTrend" />
      </div>
      <div class="lg:col-span-2">
        <CategoryDonut :categories="summary.byCategory" :total="summary.totalMonthlySpend" />
      </div>
    </div>

    <!-- Recent transactions -->
    <RecentTransactionsList />

    <!-- Add expense dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <TransactionForm :key="String(dialog)" @close="dialog = false" @created="dialog = false" />
    </v-dialog>
  </div>
</template>
