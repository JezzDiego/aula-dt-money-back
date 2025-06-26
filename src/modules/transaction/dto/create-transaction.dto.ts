import { TransactionType } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class CreateTransactionDto {
  @IsString({ message: 'Title must be a string' })
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  title: string;
  category: string;
  data: Date;
  price: number;
  @IsEnum(TransactionType)
  type: TransactionType;
}
