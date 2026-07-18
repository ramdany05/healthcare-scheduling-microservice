import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Customer } from '../customer/customer.model';
import { Doctor } from '../doctor/doctor.model';

@ObjectType({ description: 'Jadwal konsultasi antara customer dan dokter' })
export class Schedule {
  @Field(() => ID, { description: 'Unique identifier' })
  id: string;

  @Field({ description: 'Tujuan konsultasi' })
  objective: string;

  @Field({ description: 'ID customer yang dijadwalkan' })
  customerId: string;

  @Field({ description: 'ID dokter yang dijadwalkan' })
  doctorId: string;

  @Field({ description: 'Waktu konsultasi (ISO 8601)' })
  scheduledAt: Date;

  @Field({ description: 'Waktu pembuatan jadwal' })
  createdAt: Date;

  @Field({ description: 'Waktu terakhir update' })
  updatedAt: Date;

  @Field(() => Customer, { nullable: true, description: 'Data customer terkait' })
  customer?: Customer;

  @Field(() => Doctor, { nullable: true, description: 'Data dokter terkait' })
  doctor?: Doctor;
}
