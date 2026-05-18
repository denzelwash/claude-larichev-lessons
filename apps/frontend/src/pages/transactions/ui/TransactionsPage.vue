<script setup lang="ts">
import { PageHeader } from '@/shared/ui';
</script>

<template>
  <div>
    <PageHeader title="Транзакции" />
    <section class="page-card p-10 flex flex-col items-center text-center">
      <div class="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
        <v-icon icon="mdi-swap-horizontal" color="#2563EB" size="32" />
      </div>
      <h2 class="font-semibold text-ink text-[16px] mb-2">Раздел в разработке</h2>
      <p class="text-[13px] text-ink-secondary max-w-xs">
        Здесь появится полная история транзакций с фильтрацией и поиском.
      </p>
    </section>
  </div>
</template>
