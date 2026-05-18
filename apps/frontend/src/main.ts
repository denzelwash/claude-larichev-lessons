import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import VueApexCharts from 'vue3-apexcharts';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import './assets/main.css';

import App from './app/App.vue';
import { router } from './router';

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'expenseLight',
    themes: {
      expenseLight: {
        dark: false,
        colors: {
          primary: '#2563EB',
          'primary-darken-1': '#1D4ED8',
          secondary: '#475569',
          background: '#F5F9FF',
          surface: '#FFFFFF',
          error: '#DC2626',
          success: '#16A34A',
          warning: '#D97706',
          info: '#0EA5E9',
        },
      },
    },
  },
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(vuetify);
app.use(VueApexCharts);
app.mount('#app');
