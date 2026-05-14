import type { CreateTransactionInput, TransactionDto } from '@app/shared';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { createTransaction, fetchTransactions } from '../api/transactions.api';

export const useTransactionsStore = defineStore('transactions', () => {
  const recent = ref<TransactionDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function loadRecent(limit = 10) {
    loading.value = true;
    error.value = null;
    try {
      recent.value = await fetchTransactions({ limit, offset: 0 });
    } catch {
      error.value = 'Не удалось загрузить транзакции';
    } finally {
      loading.value = false;
    }
  }

  async function create(input: CreateTransactionInput): Promise<TransactionDto> {
    const created = await createTransaction(input);
    await loadRecent(10);
    return created;
  }

  return { recent, loading, error, loadRecent, create };
});
