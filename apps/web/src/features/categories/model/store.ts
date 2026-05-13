import type { CategoryDto } from '@app/shared';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchCategories } from '../api/categories.api';

export const useCategoriesStore = defineStore('categories', () => {
  const items = ref<CategoryDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load(force = false) {
    if (!force && items.value.length > 0) return;
    loading.value = true;
    error.value = null;
    try {
      items.value = await fetchCategories();
    } catch {
      error.value = 'Не удалось загрузить категории';
    } finally {
      loading.value = false;
    }
  }

  return { items, loading, error, load };
});
