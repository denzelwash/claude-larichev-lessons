import type { CreateTransactionInput, QueryTransactionsParams, TransactionDto } from '@app/shared';
import { http } from '@/shared/api/http';

export async function fetchTransactions(params: QueryTransactionsParams): Promise<TransactionDto[]> {
  const { data } = await http.get<TransactionDto[]>('/transactions', { params });
  return data;
}

export async function createTransaction(input: CreateTransactionInput): Promise<TransactionDto> {
  const { data } = await http.post<TransactionDto>('/transactions', input);
  return data;
}
