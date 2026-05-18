<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  categories: { name: string; value: number; color: string }[];
  total: number;
}>();

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    background: 'transparent',
    animations: { enabled: true, easing: 'easeinout', speed: 600 },
  },
  labels: props.categories.map((c) => c.name),
  colors: props.categories.map((c) => c.color),
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: '72%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Итого',
            color: '#94A3B8',
            fontSize: '12px',
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            formatter: () => `₽${(props.total / 1000).toFixed(0)}k`,
          },
          value: {
            show: true,
            fontSize: '22px',
            fontWeight: 700,
            fontFamily: 'Sora, system-ui, sans-serif',
            color: '#0F172A',
            offsetY: 2,
            formatter: (v: string) => `${v}%`,
          },
        },
      },
    },
  },
  legend: {
    show: true,
    position: 'bottom',
    fontSize: '12px',
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    labels: { colors: '#475569' },
    markers: { width: 8, height: 8, radius: 4 },
    itemMargin: { horizontal: 8, vertical: 4 },
  },
  stroke: { width: 0 },
  tooltip: {
    y: { formatter: (v: number) => `${v}%` },
  },
}));

const series = computed(() => props.categories.map((c) => c.value));
</script>

<template>
  <section class="page-card p-6">
    <h2 class="text-[15px] font-semibold text-ink mb-4">Расходы по категориям</h2>
    <apexchart type="donut" height="260" :options="chartOptions" :series="series" />
  </section>
</template>
