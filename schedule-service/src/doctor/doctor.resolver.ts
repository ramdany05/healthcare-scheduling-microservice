import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { DoctorService } from './doctor.service';
import { Doctor } from './doctor.model';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Resolver(() => Doctor)
@UseGuards(AuthGuard)
export class DoctorResolver {
  constructor(private doctorService: DoctorService) {}

  @Mutation(() => Doctor, { description: 'Membuat dokter baru' })
  async createDoctor(
    @Args('name', { description: 'Nama lengkap dokter' }) name: string,
  ) {
    return this.doctorService.create(name);
  }

  @Query(() => DoctorListResponse, { description: 'List semua dokter dengan pagination' })
  async doctors(
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1, description: 'Halaman (default: 1)' }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10, description: 'Jumlah item per halaman (default: 10)' }) limit: number,
  ) {
    return this.doctorService.findAll(page, limit);
  }

  @Query(() => Doctor, { description: 'Get dokter by ID' })
  async doctor(@Args('id', { description: 'UUID dokter' }) id: string) {
    return this.doctorService.findOne(id);
  }

  @Mutation(() => Doctor, { description: 'Update data dokter' })
  async updateDoctor(
    @Args('id', { description: 'UUID dokter' }) id: string,
    @Args('name', { nullable: true, description: 'Nama baru (opsional)' }) name?: string,
  ) {
    return this.doctorService.update(id, name);
  }

  @Mutation(() => Boolean, { description: 'Hapus dokter (cascade: jadwal terkait ikut terhapus)' })
  async deleteDoctor(@Args('id', { description: 'UUID dokter' }) id: string) {
    return this.doctorService.delete(id);
  }
}

@ObjectType({ description: 'List response dengan pagination metadata' })
class DoctorListResponse {
  @Field(() => [Doctor], { description: 'Daftar dokter' })
  items: Doctor[];

  @Field(() => Int, { description: 'Total seluruh dokter' })
  total: number;

  @Field(() => Int, { description: 'Halaman saat ini' })
  page: number;

  @Field(() => Int, { description: 'Jumlah item per halaman' })
  limit: number;

  @Field(() => Int, { description: 'Total halaman' })
  totalPages: number;
}
