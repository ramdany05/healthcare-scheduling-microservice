import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { scheduleCreatedEmail, scheduleCancelledEmail } from '../email/email.templates';

const CACHE_TTL = 60;

@Injectable()
export class ScheduleService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private emailService: EmailService,
  ) {}

  async create(objective: string, customerId: string, doctorId: string, scheduledAt: Date) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const existingSchedule = await this.prisma.schedule.findFirst({
      where: {
        doctorId,
        scheduledAt,
      },
    });

    if (existingSchedule) {
      throw new ConflictException('Doctor already has a schedule at this time');
    }

    const schedule = await this.prisma.schedule.create({
      data: {
        objective,
        customerId,
        doctorId,
        scheduledAt,
      },
      include: {
        customer: true,
        doctor: true,
      },
    });

    await this.invalidateListCache();

    this.emailService.sendMail(
      scheduleCreatedEmail({
        customerName: customer.name,
        customerEmail: customer.email,
        objective,
        doctorName: doctor.name,
        scheduledAt,
      }),
    ).catch(() => {});

    return schedule;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    customerId?: string,
    doctorId?: string,
  ) {
    const cacheKey = `schedules:list:${page}:${limit}:${customerId ?? 'all'}:${doctorId ?? 'all'}`;
    const cached = await this.redis.client.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const skip = (page - 1) * limit;

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (doctorId) where.doctorId = doctorId;

    const [items, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          customer: true,
          doctor: true,
        },
      }),
      this.prisma.schedule.count({ where }),
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
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        customer: true,
        doctor: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async delete(id: string) {
    const schedule = await this.findOne(id);

    await this.prisma.schedule.delete({
      where: { id },
    });

    await this.invalidateListCache();

    this.emailService.sendMail(
      scheduleCancelledEmail({
        customerName: schedule.customer!.name,
        customerEmail: schedule.customer!.email,
        objective: schedule.objective,
      }),
    ).catch(() => {});

    return true;
  }

  private async invalidateListCache() {
    const keys = await this.redis.client.keys('schedules:list:*');
    if (keys.length > 0) {
      await this.redis.client.del(...keys);
    }
  }
}
