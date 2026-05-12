<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth';

const auth = useAuthStore();
const router = useRouter();

const form = ref<{ email: string; password: string }>({ email: '', password: '' });
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

const emailRules = [
  (v: string) => !!v || 'Введите email',
  (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Некорректный email',
];

const passwordRules = [
  (v: string) => !!v || 'Введите пароль',
  (v: string) => v.length >= 8 || 'Минимум 8 символов',
];

async function onSubmit() {
  const { valid } = await formRef.value!.validate();
  if (!valid) return;
  try {
    await auth.loginAction(form.value);
    router.push({ name: 'home' });
  } catch {
    // ошибка уже записана в auth.error
  }
}
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5">
        <v-card elevation="4">
          <v-card-title class="text-h5 pa-6 pb-2">Вход</v-card-title>
          <v-card-text>
            <v-alert
              v-if="auth.error"
              type="error"
              class="mb-4"
              variant="tonal"
              closable
              @click:close="auth.error = null"
            >
              {{ auth.error }}
            </v-alert>
            <v-form ref="formRef" @submit.prevent="onSubmit">
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                :rules="emailRules"
                variant="outlined"
                class="mb-2"
                autocomplete="email"
              />
              <v-text-field
                v-model="form.password"
                label="Пароль"
                type="password"
                :rules="passwordRules"
                variant="outlined"
                class="mb-4"
                autocomplete="current-password"
              />
              <v-btn
                type="submit"
                color="primary"
                :loading="auth.loading"
                block
                size="large"
              >
                Войти
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center pb-4">
            <span class="text-body-2 text-medium-emphasis">Нет аккаунта?</span>
            <RouterLink to="/register" class="ml-1 text-body-2">Зарегистрироваться</RouterLink>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
