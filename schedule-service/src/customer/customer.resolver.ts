import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { CustomerService } from './customer.service';
import { Customer } from './customer.model';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Resolver(() => Customer)
@UseGuards(AuthGuard)
export class CustomerResolver {
  constructor(private customerService: CustomerService) {}

  @Mutation(() => Customer, { description: 'Membuat customer baru (email harus unique)' })
  async createCustomer(
    @Args('name', { description: 'Nama lengkap customer' }) name: string,
    @Args('email', { description: 'Email customer (harus unique)' }) email: string,
  ) {
    return this.customerService.create(name, email);
  }

  @Query(() => CustomerListResponse, { description: 'List semua customer dengan pagination' })
  async customers(
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1, description: 'Halaman (default: 1)' }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10, description: 'Jumlah item per halaman (default: 10)' }) limit: number,
  ) {
    return this.customerService.findAll(page, limit);
  }

  @Query(() => Customer, { description: 'Get customer by ID' })
  async customer(@Args('id', { description: 'UUID customer' }) id: string) {
    return this.customerService.findOne(id);
  }

  @Mutation(() => Customer, { description: 'Update data customer' })
  async updateCustomer(
    @Args('id', { description: 'UUID customer' }) id: string,
    @Args('name', { nullable: true, description: 'Nama baru (opsional)' }) name?: string,
    @Args('email', { nullable: true, description: 'Email baru (opsional)' }) email?: string,
  ) {
    return this.customerService.update(id, name, email);
  }

  @Mutation(() => Boolean, { description: 'Hapus customer (cascade: jadwal terkait ikut terhapus)' })
  async deleteCustomer(@Args('id', { description: 'UUID customer' }) id: string) {
    return this.customerService.delete(id);
  }
}

@ObjectType({ description: 'List response dengan pagination metadata' })
class CustomerListResponse {
  @Field(() => [Customer], { description: 'Daftar customer' })
  items: Customer[];

  @Field(() => Int, { description: 'Total seluruh customer' })
  total: number;

  @Field(() => Int, { description: 'Halaman saat ini' })
  page: number;

  @Field(() => Int, { description: 'Jumlah item per halaman' })
  limit: number;

  @Field(() => Int, { description: 'Total halaman' })
  totalPages: number;
}
