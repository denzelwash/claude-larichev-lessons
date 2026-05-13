<script setup lang="ts">
import type { CreateTransactionInput, TransactionType } from '@app/shared';
import { useCategoriesStore } from '@/features/categories';
import { useTransactionsStore } from '@/features/transactions';
import { computed, onMounted, ref } from 'vue';
import type { VForm } from 'vuetify/components';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created'): void;
}>();

const categoriesStore = useCategoriesStore();
const transactionsStore = useTransactionsStore();

const today = new Date().toISOString().slice(0, 10);

const type = ref<TransactionType>('expense');
const amount = ref<number | null>(null);
const categoryId = ref<string | null>(null);
const date = ref(today);
const description = ref('');

const loading = ref(false);
const errorMessage = ref<string | null>(null);
const formRef = ref<InstanceType<typeof VForm> | null>(null);

const hasCategories = computed(() => categoriesStore.items.length > 0);

const rules = {
  required: (v: unknown) => (v !== null && v !== undefined && v !== '') || 'Обязательное поле',
  positive: (v: number | null) => (v !== null && v > 0) || 'Сумма должна быть больше нуля',
  maxLen: (max: number) => (v: string) => !v || v.length <= max || `Не более ${max} символов`,
};

onMounted(() => categoriesStore.load());

async function onSubmit() {
  const result = await formRef.value?.validate();
  if (!result?.valid) return;

  errorMessage.value = null;
  loading.value = true;
  try {
    const payload: CreateTransactionInput = {
      amount: amount.value as number,
      type: type.value,
      date: `${date.value}T00:00:00.000`,
      categoryId: categoryId.value!,
      ...(description.value && { description: description.value }),
    };
    await transactionsStore.create(payload);
    emit('created');
  } catch {
    errorMessage.value = 'Не удалось создать транзакцию';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-card>
    <v-card-title>Новая транзакция</v-card-title>

    <v-card-text>
      <v-alert v-if="!categoriesStore.loading && !hasCategories" type="info" variant="tonal" class="mb-4">
        Сначала создайте категорию через раздел «Категории».
      </v-alert>

      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
        {{ errorMessage }}
      </v-alert>

      <v-form ref="formRef" :disabled="loading || !hasCategories" @submit.prevent="onSubmit">
        <v-btn-toggle v-model="type" mandatory color="primary" class="mb-4" divided>
          <v-btn value="expense">Расход</v-btn>
          <v-btn value="income">Доход</v-btn>
        </v-btn-toggle>

        <v-text-field
          v-model.number="amount"
          label="Сумма"
          type="number"
          step="0.01"
          min="0.01"
          :rules="[rules.required, rules.positive]"
          required
        />

        <v-select
          v-model="categoryId"
          :items="categoriesStore.items"
          :loading="categoriesStore.loading"
          label="Категория"
          item-title="name"
          item-value="id"
          :rules="[rules.required]"
          required
        >
          <template #selection="{ item }">
            <v-icon :icon="item.raw.icon" :color="item.raw.color" class="mr-2" />
            {{ item.raw.name }}
          </template>
          <template #item="{ item, props }">
            <v-list-item v-bind="props" :title="item.raw.name">
              <template #prepend>
                <v-icon :icon="item.raw.icon" :color="item.raw.color" />
              </template>
            </v-list-item>
          </template>
        </v-select>

        <v-text-field v-model="date" label="Дата" type="date" :rules="[rules.required]" required />

        <v-textarea
          v-model="description"
          label="Описание (необязательно)"
          rows="2"
          maxlength="255"
          counter
          :rules="[rules.maxLen(255)]"
        />
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn variant="text" :disabled="loading" @click="emit('close')">Отмена</v-btn>
      <v-btn color="primary" type="submit" :loading="loading" :disabled="!hasCategories">
        Сохранить
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
