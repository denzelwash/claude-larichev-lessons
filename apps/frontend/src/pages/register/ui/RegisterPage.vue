<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth';

const auth = useAuthStore();
const router = useRouter();

const form = ref<{ name: string; email: string; password: string }>({
  name: '',
  email: '',
  password: '',
});
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const agreed = ref(false);

const nameRules = [
  (v: string) => !!v || 'Введите имя',
  (v: string) => v.length >= 2 || 'Минимум 2 символа',
];

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
    await auth.registerAction(form.value);
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
          Начни отслеживать<br />финансы уже сегодня
        </h2>
        <p class="text-white/70 text-[14px] leading-relaxed">
          Регистрация займёт меньше минуты.<br />
          Полный контроль над расходами — бесплатно.
        </p>
      </div>
    </div>

    <!-- Form panel -->
    <div class="auth-form-panel">
      <div class="auth-form-wrap">
        <h1 class="font-display text-[26px] font-bold text-ink mb-1">Создать аккаунт</h1>
        <p class="text-ink-secondary text-[14px] mb-7">Заполните данные для регистрации</p>

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
            v-model="form.name"
            label="Имя"
            :rules="nameRules"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            autocomplete="name"
            hide-details="auto"
          />
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
            autocomplete="new-password"
            hide-details="auto"
          />
          <v-checkbox
            v-model="agreed"
            :rules="[(v: boolean) => v || 'Необходимо принять соглашение']"
            density="compact"
            hide-details="auto"
            class="mt-2 mb-4"
          >
            <template #label>
              <span class="text-[13px] text-ink-secondary">
                Согласен с
                <a
                  href="/terms"
                  target="_blank"
                  class="text-brand-600 hover:underline"
                  @click.stop
                >пользовательским соглашением</a>
                и
                <a
                  href="/privacy"
                  target="_blank"
                  class="text-brand-600 hover:underline"
                  @click.stop
                >политикой обработки данных</a>
              </span>
            </template>
          </v-checkbox>
          <v-btn
            type="submit"
            color="primary"
            :loading="auth.loading"
            block
            size="large"
            class="rounded-xl text-capitalize"
            style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 14px;"
          >
            Зарегистрироваться
          </v-btn>
        </v-form>

        <p class="text-center text-[13px] text-ink-secondary mt-5">
          Уже есть аккаунт?
          <RouterLink to="/login" class="text-brand-600 font-semibold hover:underline ml-1">
            Войти
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-shell {
  display: flex;
  min-height: 100vh;
  background: #f5f9ff;
}

.auth-brand {
  width: 380px;
  flex-shrink: 0;
  background-image: linear-gradient(145deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%);
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
}

.auth-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.auth-form-wrap {
  width: 100%;
  max-width: 360px;
}

@media (max-width: 768px) {
  .auth-brand {
    display: none;
  }
}
</style>
