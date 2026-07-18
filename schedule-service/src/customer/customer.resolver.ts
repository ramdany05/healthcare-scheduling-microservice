import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { CustomerService } from './customer.service';
import { Customer } from './customer.model';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Resolver(() => Customer)
@UseGuards(AuthGuard)
export class CustomerResolver {
  constructor(private customerService: CustomerService) {}

  @Mutation(() => Customer)
  async createCustomer(
    @Args('name') name: string,
    @Args('email') email: string,
  ) {
    return this.customerService.create(name, email);
  }

  @Query(() => CustomerListResponse)
  async customers(
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
  ) {
    return this.customerService.findAll(page, limit);
  }

  @Query(() => Customer)
  async customer(@Args('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Mutation(() => Customer)
  async updateCustomer(
    @Args('id') id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('email', { nullable: true }) email?: string,
  ) {
    return this.customerService.update(id, name, email);
  }

  @Mutation(() => Boolean)
  async deleteCustomer(@Args('id') id: string) {
    return this.customerService.delete(id);
  }
}

@ObjectType()
class CustomerListResponse {
  @Field(() => [Customer])
  items: Customer[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}
