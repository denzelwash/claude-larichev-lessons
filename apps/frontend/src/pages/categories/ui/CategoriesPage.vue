<script setup lang="ts">
import { PageHeader } from '@/shared/ui';
</script>

<template>
  <div>
    <PageHeader title="Категории" />
    <section class="page-card p-10 flex flex-col items-center text-center">
      <div class="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
        <v-icon icon="mdi-tag-multiple-outline" color="#2563EB" size="32" />
      </div>
      <h2 class="font-semibold text-ink text-[16px] mb-2">Раздел в разработке</h2>
      <p class="text-[13px] text-ink-secondary max-w-xs">
        Здесь появится управление категориями расходов и доходов.
      </p>
    </section>
  </div>
</template>
