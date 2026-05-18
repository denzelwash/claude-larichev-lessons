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
  <div class="auth-shell">
    <!-- Brand panel -->
    <div class="auth-brand">
      <div class="flex items-center gap-3 mb-auto">
        <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <v-icon icon="mdi-wallet-outline" color="white" size="22" />
        </div>
        <span class="text-white font-semibold text-[15px]">Expense Tracker</span>
      </div>
      <div class="mt-auto">
        <h2 class="text-white text-2xl font-bold leading-snug mb-3">
          Контролируй<br />свои расходы
        </h2>
        <p class="text-white/70 text-[14px] leading-relaxed">
          Отслеживай траты, анализируй&nbsp;категории<br />и принимай взвешенные финансовые решения.
        </p>
      </div>
    </div>

    <!-- Form panel -->
    <div class="auth-form-panel">
      <div class="auth-form-wrap">
        <h1 class="font-display text-[26px] font-bold text-ink mb-1">Добро пожаловать</h1>
        <p class="text-ink-secondary text-[14px] mb-7">Войдите в свой аккаунт</p>

        <v-alert
          v-if="auth.error"
          type="error"
          class="mb-5"
          variant="tonal"
          density="compact"
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
            hide-details="auto"
          />
          <v-text-field
            v-model="form.password"
            label="Пароль"
            type="password"
            :rules="passwordRules"
            variant="outlined"
            density="comfortable"
            autocomplete="current-password"
            hide-details="auto"
          />
          <v-btn
            type="submit"
            color="primary"
            :loading="auth.loading"
            block
            size="large"
            class="mt-5 rounded-xl text-capitalize"
            style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 14px;"
          >
            Войти
          </v-btn>
        </v-form>

        <p class="text-center text-[13px] text-ink-secondary mt-5">
          Нет аккаунта?
          <RouterLink to="/register" class="text-brand-600 font-semibold hover:underline ml-1">
            Зарегистрироваться
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
