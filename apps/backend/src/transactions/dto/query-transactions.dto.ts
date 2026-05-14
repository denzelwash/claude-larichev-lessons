import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** DTO для фильтрации и пагинации списка транзакций. */
export class QueryTransactionsDto {
  /** Номер месяца для фильтрации (1–12). Используется вместе с `year`. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  /** Год для фильтрации (≥ 1970). Используется вместе с `month`. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1970)
  year?: number;

  /** Максимальное количество записей в ответе (1–100). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  /** Количество записей, которые нужно пропустить (для пагинации). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
