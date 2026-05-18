// TODO: заменить на GET /dashboard/summary после реализации в apps/backend
// Эндпоинт должен возвращать: totalMonthlySpend, totalCategories, totalTransactions,
// spendingTrend (агрегация по неделям текущего месяца), byCategory (разбивка расходов).

export interface DashboardSummary {
  totalMonthlySpend: number;
  totalCategories: number;
  totalTransactions: number;
  spendingDelta: number;
  transactionsDelta: number;
  spendingTrend: number[];
  byCategory: { name: string; value: number; color: string }[];
}

export const mockSummary: DashboardSummary = {
  totalMonthlySpend: 21895,
  totalCategories: 8,
  totalTransactions: 52,
  spendingDelta: 2.5,
  transactionsDelta: 10,
  spendingTrend: [4200, 7800, 5400, 6100, 3900, 8300, 6700, 5500],
  byCategory: [
    { name: 'Еда', value: 45, color: '#2563EB' },
    { name: 'Транспорт', value: 15, color: '#60A5FA' },
    { name: 'Счета', value: 25, color: '#93C5FD' },
    { name: 'Прочее', value: 15, color: '#BFDBFE' },
  ],
};
