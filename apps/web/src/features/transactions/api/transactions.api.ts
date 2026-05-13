import type { QueryTransactionsParams, TransactionDto } from '@app/shared';
import { http } from '@/shared/api/http';

export async function fetchTransactions(params: QueryTransactionsParams): Promise<TransactionDto[]> {
  const { data } = await http.get<TransactionDto[]>('/transactions', { params });
  return data;
}
