import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ category, data, price, title, type }: CreateTransactionDto) {
    const createdTransaction = await this.prisma.transaction.create({
      data: {
        title,
        category,
        data,
        price,
        type,
      },
    });
    return createdTransaction;
  }

  async findAll() {
    transactions = await this.prisma.transaction.findMany().catch((error) => {
      throw new InternalServerErrorException(
        'Error fetching transactions: ' + error.message,
      );
    });

    if (!transactions || transactions.length === 0) {
      throw new NotFoundException('No transactions found');
    }

    return transactions;
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    await this.findOne(id).catch((error) => {
      throw new NotFoundException(
        `Transaction with id ${id} not found: ${error.message}`,
      );
    });

    return this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id).catch((error) => {
      throw new NotFoundException(
        `Transaction with id ${id} not found: ${error.message}`,
      );
    });

    await this.prisma.transaction.delete({
      where: { id },
    });
  }
}
