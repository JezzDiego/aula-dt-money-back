import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
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

  async getAggregated() {
    try {
      const [incomeTotal, outcomeTotal, totalTransactions] = await Promise.all([
        // Soma total de transações do tipo INCOME
        this.prisma.transaction.aggregate({
          where: { type: 'INCOME' },
          _sum: { price: true },
        }),
        // Soma total de transações do tipo OUTCOME
        this.prisma.transaction.aggregate({
          where: { type: 'OUTCOME' },
          _sum: { price: true },
        }),
        // Contagem total de transações
        this.prisma.transaction.count(),
      ]);

      return {
        totalIncome: incomeTotal._sum.price || 0,
        totalOutcome: outcomeTotal._sum.price || 0,
        totalTransactions: totalTransactions,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching transaction aggregates: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  }

  async findAll(skip: number = 0, take: number = 10) {
    try {
      const transactions = await this.prisma.transaction.findMany({
        skip,
        take,
      });

      return transactions;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error fetching transactions: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }
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
    try {
      await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        `Transaction with id ${id} not found: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
    });
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        `Transaction with id ${id} not found: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    await this.prisma.transaction.delete({
      where: { id },
    });
  }
}
