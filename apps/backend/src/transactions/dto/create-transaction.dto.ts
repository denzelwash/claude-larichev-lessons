import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

/** DTO для создания новой транзакции. */
export class CreateTransactionDto {
  /** Сумма транзакции. Должна быть положительным числом. */
  @ApiProperty({ example: 1500 })
  @IsNumber()
  @IsPositive()
  amount: number;

  /** Тип транзакции: доход (`INCOME`) или расход (`EXPENSE`). */
  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  type: TransactionType;

  /** Произвольное описание транзакции. Не более 255 символов. */
  @ApiPropertyOptional({ example: 'Покупка в супермаркете', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  /** Дата транзакции в формате ISO 8601 (например, `2024-01-15`). */
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  /** Идентификатор категории, к которой относится транзакция. */
  @ApiProperty({ example: 'clx1y2z3a0000abc123def456' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
