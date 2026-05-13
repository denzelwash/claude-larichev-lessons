export type TransactionType = 'income' | 'expense';

export interface TransactionDto {
  id: string;
  amount: string;
  type: TransactionType;
  description: string | null;
  date: string;
  categoryId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueryTransactionsParams {
  month?: number;
  year?: number;
  limit?: number;
  offset?: number;
}
