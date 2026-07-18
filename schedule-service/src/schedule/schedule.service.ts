import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async create(objective: string, customerId: string, doctorId: string, scheduledAt: Date) {
    // Validate customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Validate doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Check for schedule conflict (same doctor at same time)
    const existingSchedule = await this.prisma.schedule.findFirst({
      where: {
        doctorId,
        scheduledAt,
      },
    });

    if (existingSchedule) {
      throw new ConflictException('Doctor already has a schedule at this time');
    }

    return this.prisma.schedule.create({
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
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    customerId?: string,
    doctorId?: string,
  ) {
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

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
    await this.findOne(id);

    await this.prisma.schedule.delete({
      where: { id },
    });

    return true;
  }
}
