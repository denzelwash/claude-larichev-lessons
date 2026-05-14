import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { PublicUser } from '@/shared/types';
import { loginApi, registerApi, getMeApi, type LoginDto, type RegisterDto } from '../api/authApi';
import { TOKEN_KEY } from '@/shared/api/http';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<PublicUser | null>(null);
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const loading = ref(false);
  const error = ref<string | null>(null);

  function setToken(t: string) {
    token.value = t;
    localStorage.setItem(TOKEN_KEY, t);
  }

  async function fetchMe() {
    user.value = await getMeApi();
  }

  async function loginAction(dto: LoginDto) {
    loading.value = true;
    error.value = null;
    try {
      const { accessToken } = await loginApi(dto);
      setToken(accessToken);
      await fetchMe();
    } catch (e) {
      error.value = extractMessage(e, 'Неверный email или пароль');
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function registerAction(dto: RegisterDto) {
    loading.value = true;
    error.value = null;
    try {
      const { accessToken } = await registerApi(dto);
      setToken(accessToken);
      await fetchMe();
    } catch (e) {
      error.value = extractMessage(e, 'Ошибка регистрации');
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  return { user, token, loading, error, fetchMe, loginAction, registerAction, logout };
});

function extractMessage(e: unknown, fallback: string): string {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const r = (e as { response?: { data?: { message?: string } } }).response;
    return r?.data?.message ?? fallback;
  }
  return fallback;
}
