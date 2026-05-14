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
          <v-card-title class="text-h5 px-6 pt-6 pb-1">Вход</v-card-title>
          <v-card-text class="px-6 pt-4 pb-2">
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
                density="comfortable"
                class="mb-3"
                autocomplete="email"
              />
              <v-text-field
                v-model="form.password"
                label="Пароль"
                type="password"
                :rules="passwordRules"
                variant="outlined"
                density="comfortable"
                autocomplete="current-password"
              />
              <v-btn
                type="submit"
                color="primary"
                :loading="auth.loading"
                block
                size="large"
                class="mt-4"
              >
                Войти
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center py-4">
            <span class="text-body-2 text-medium-emphasis">Нет аккаунта?</span>
            <RouterLink to="/register" class="ml-1 text-body-2">Зарегистрироваться</RouterLink>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
