import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import './assets/main.css';

import App from './app/App.vue';
import { router } from './router';

const vuetify = createVuetify();

createApp(App).use(createPinia()).use(router).use(vuetify).mount('#app');
