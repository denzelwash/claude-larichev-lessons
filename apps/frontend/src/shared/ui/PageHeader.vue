<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-[26px] font-bold text-ink tracking-tight font-display">{{ title }}</h1>
    <div class="flex items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>
