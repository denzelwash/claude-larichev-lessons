import type { CategoryDto } from '@app/shared';
import { http } from '@/shared/api/http';

export async function fetchCategories(): Promise<CategoryDto[]> {
  const { data } = await http.get<CategoryDto[]>('/categories');
  return data;
}
