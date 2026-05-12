import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
