<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  data: number[];
}>();

const chartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    sparkline: { enabled: false },
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    background: 'transparent',
    animations: { enabled: true, easing: 'easeinout', speed: 600 },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3, colors: ['#2563EB'] },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.28,
      opacityTo: 0.02,
      stops: [0, 100],
      colorStops: [
        { offset: 0, color: '#3B82F6', opacity: 0.28 },
        { offset: 100, color: '#3B82F6', opacity: 0.02 },
      ],
    },
  },
  grid: {
    borderColor: '#F1F5F9',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { left: 4, right: 4 },
  },
  xaxis: {
    categories: ['Нед 1', '', 'Нед 2', '', 'Нед 3', '', 'Нед 4', ''],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: {
        colors: '#94A3B8',
        fontSize: '12px',
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#94A3B8',
        fontSize: '11px',
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      },
      formatter: (v: number) => `₽${(v / 1000).toFixed(0)}k`,
    },
  },
  tooltip: {
    theme: 'light',
    y: { formatter: (v: number) => `₽${v.toLocaleString('ru-RU')}` },
  },
  markers: { size: 0, hover: { size: 5, sizeOffset: 2 } },
}));

const series = computed(() => [{ name: 'Расходы', data: props.data }]);
</script>

<template>
  <section class="page-card p-6">
    <h2 class="text-[15px] font-semibold text-ink mb-4">Тренд расходов</h2>
    <apexchart type="area" height="200" :options="chartOptions" :series="series" />
  </section>
</template>
