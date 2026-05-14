import { PartialType } from '@nestjs/swagger';
import { CreateTransactionDto } from './create-transaction.dto';

/** DTO для частичного обновления транзакции. Все поля `CreateTransactionDto` становятся необязательными. */
export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
