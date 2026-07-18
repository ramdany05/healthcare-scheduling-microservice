import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { DoctorService } from './doctor.service';
import { Doctor } from './doctor.model';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Resolver(() => Doctor)
@UseGuards(AuthGuard)
export class DoctorResolver {
  constructor(private doctorService: DoctorService) {}

  @Mutation(() => Doctor)
  async createDoctor(@Args('name') name: string) {
    return this.doctorService.create(name);
  }

  @Query(() => DoctorListResponse)
  async doctors(
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
  ) {
    return this.doctorService.findAll(page, limit);
  }

  @Query(() => Doctor)
  async doctor(@Args('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @Mutation(() => Doctor)
  async updateDoctor(
    @Args('id') id: string,
    @Args('name', { nullable: true }) name?: string,
  ) {
    return this.doctorService.update(id, name);
  }

  @Mutation(() => Boolean)
  async deleteDoctor(@Args('id') id: string) {
    return this.doctorService.delete(id);
  }
}

@ObjectType()
class DoctorListResponse {
  @Field(() => [Doctor])
  items: Doctor[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}
