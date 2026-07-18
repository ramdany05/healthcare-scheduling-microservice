import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { ScheduleService } from './schedule.service';
import { Schedule } from './schedule.model';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Resolver(() => Schedule)
@UseGuards(AuthGuard)
export class ScheduleResolver {
  constructor(private scheduleService: ScheduleService) {}

  @Mutation(() => Schedule, { description: 'Membuat jadwal konsultasi baru. Dokter tidak boleh memiliki jadwal di waktu yang sama' })
  async createSchedule(
    @Args('objective', { description: 'Tujuan konsultasi' }) objective: string,
    @Args('customerId', { description: 'UUID customer yang valid' }) customerId: string,
    @Args('doctorId', { description: 'UUID dokter yang valid' }) doctorId: string,
    @Args('scheduledAt', { description: 'Waktu konsultasi (ISO 8601)' }) scheduledAt: Date,
  ) {
    return this.scheduleService.create(objective, customerId, doctorId, scheduledAt);
  }

  @Query(() => ScheduleListResponse, { description: 'List semua jadwal dengan filter dan pagination' })
  async schedules(
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1, description: 'Halaman (default: 1)' }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10, description: 'Jumlah item per halaman (default: 10)' }) limit: number,
    @Args('customerId', { nullable: true, description: 'Filter by customer ID (opsional)' }) customerId?: string,
    @Args('doctorId', { nullable: true, description: 'Filter by doctor ID (opsional)' }) doctorId?: string,
  ) {
    return this.scheduleService.findAll(page, limit, customerId, doctorId);
  }

  @Query(() => Schedule, { description: 'Get jadwal by ID' })
  async schedule(@Args('id', { description: 'UUID jadwal' }) id: string) {
    return this.scheduleService.findOne(id);
  }

  @Mutation(() => Boolean, { description: 'Hapus jadwal' })
  async deleteSchedule(@Args('id', { description: 'UUID jadwal' }) id: string) {
    return this.scheduleService.delete(id);
  }
}

@ObjectType({ description: 'List response dengan pagination metadata' })
class ScheduleListResponse {
  @Field(() => [Schedule], { description: 'Daftar jadwal' })
  items: Schedule[];

  @Field(() => Int, { description: 'Total seluruh jadwal' })
  total: number;

  @Field(() => Int, { description: 'Halaman saat ini' })
  page: number;

  @Field(() => Int, { description: 'Jumlah item per halaman' })
  limit: number;

  @Field(() => Int, { description: 'Total halaman' })
  totalPages: number;
}
