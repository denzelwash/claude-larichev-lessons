import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { TransactionType } from '@prisma/client';

/** DTO для создания новой транзакции. */
export class CreateTransactionDto {
  /** Сумма транзакции. Должна быть положительным числом. */
  @IsNumber()
  @IsPositive()
  amount: number;

  /** Тип транзакции: доход (`INCOME`) или расход (`EXPENSE`). */
  @IsEnum(TransactionType)
  type: TransactionType;

  /** Произвольное описание транзакции. Не более 255 символов. */
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  /** Дата транзакции в формате ISO 8601 (например, `2024-01-15`). */
  @IsDateString()
  date: string;

  /** Идентификатор категории, к которой относится транзакция. */
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
