import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, email: string) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      throw new ConflictException('Email already exists');
    }

    return this.prisma.customer.create({
      data: { name, email },
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, name?: string, email?: string) {
    await this.findOne(id);

    if (email) {
      const existingCustomer = await this.prisma.customer.findFirst({
        where: {
          email,
          NOT: { id },
        },
      });

      if (existingCustomer) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    await this.prisma.customer.delete({
      where: { id },
    });

    return true;
  }
}
