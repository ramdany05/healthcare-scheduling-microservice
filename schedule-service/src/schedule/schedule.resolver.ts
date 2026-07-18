import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { ScheduleService } from './schedule.service';
import { Schedule } from './schedule.model';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Resolver(() => Schedule)
@UseGuards(AuthGuard)
export class ScheduleResolver {
  constructor(private scheduleService: ScheduleService) {}

  @Mutation(() => Schedule)
  async createSchedule(
    @Args('objective') objective: string,
    @Args('customerId') customerId: string,
    @Args('doctorId') doctorId: string,
    @Args('scheduledAt') scheduledAt: Date,
  ) {
    return this.scheduleService.create(objective, customerId, doctorId, scheduledAt);
  }

  @Query(() => ScheduleListResponse)
  async schedules(
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
    @Args('customerId', { nullable: true }) customerId?: string,
    @Args('doctorId', { nullable: true }) doctorId?: string,
  ) {
    return this.scheduleService.findAll(page, limit, customerId, doctorId);
  }

  @Query(() => Schedule)
  async schedule(@Args('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Mutation(() => Boolean)
  async deleteSchedule(@Args('id') id: string) {
    return this.scheduleService.delete(id);
  }
}

@ObjectType()
class ScheduleListResponse {
  @Field(() => [Schedule])
  items: Schedule[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}
