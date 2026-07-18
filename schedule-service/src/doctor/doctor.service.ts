import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const CACHE_TTL = 60;

@Injectable()
export class DoctorService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(name: string) {
    const doctor = await this.prisma.doctor.create({
      data: { name },
    });

    await this.invalidateListCache();

    return doctor;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const cacheKey = `doctors:list:${page}:${limit}`;
    const cached = await this.redis.client.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.doctor.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.doctor.count(),
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
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async update(id: string, name?: string) {
    await this.findOne(id);

    const doctor = await this.prisma.doctor.update({
      where: { id },
      data: {
        ...(name && { name }),
      },
    });

    await this.invalidateListCache();

    return doctor;
  }

  async delete(id: string) {
    await this.findOne(id);

    await this.prisma.doctor.delete({
      where: { id },
    });

    await this.invalidateListCache();

    return true;
  }

  private async invalidateListCache() {
    const keys = await this.redis.client.keys('doctors:list:*');
    if (keys.length > 0) {
      await this.redis.client.del(...keys);
    }
  }
}
