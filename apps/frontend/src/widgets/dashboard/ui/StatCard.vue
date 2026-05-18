<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
  delta?: number;
}>();

function deltaText(d: number) {
  return `${d > 0 ? '+' : ''}${d}% vs прошлый месяц`;
}
</script>

<template>
  <section class="page-card p-6">
    <p class="text-[13px] font-medium text-ink-secondary mb-2 uppercase tracking-wide">
      {{ label }}
    </p>
    <p class="font-display text-[32px] font-bold text-ink leading-none tracking-tight">
      {{ value }}
    </p>
    <p
      v-if="delta !== undefined"
      class="text-[12px] font-medium mt-2"
      :class="delta >= 0 ? 'text-emerald-600' : 'text-red-500'"
    >
      {{ deltaText(delta) }}
    </p>
  </section>
</template>
