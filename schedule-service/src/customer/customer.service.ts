import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const CACHE_TTL = 60;

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(name: string, email: string) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      throw new ConflictException('Email already exists');
    }

    const customer = await this.prisma.customer.create({
      data: { name, email },
    });

    await this.invalidateListCache();

    return customer;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const cacheKey = `customers:list:${page}:${limit}`;
    const cached = await this.redis.client.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count(),
    ]);

    const result = {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    await this.redis.client.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);

    return result;
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

    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
    });

    await this.invalidateListCache();

    return customer;
  }

  async delete(id: string) {
    await this.findOne(id);

    await this.prisma.customer.delete({
      where: { id },
    });

    await this.invalidateListCache();

    return true;
  }

  private async invalidateListCache() {
    const keys = await this.redis.client.keys('customers:list:*');
    if (keys.length > 0) {
      await this.redis.client.del(...keys);
    }
  }
}
