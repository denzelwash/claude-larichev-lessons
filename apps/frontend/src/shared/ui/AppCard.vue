<script setup lang="ts">
defineProps<{
  title?: string;
  padding?: string;
}>();
</script>

<template>
  <section class="page-card" :class="padding ?? 'p-6'">
    <div v-if="$slots.header || title" class="flex items-center justify-between mb-5">
      <h2 v-if="title" class="text-[15px] font-semibold text-ink">{{ title }}</h2>
      <slot name="header" />
    </div>
    <slot />
  </section>
</template>
