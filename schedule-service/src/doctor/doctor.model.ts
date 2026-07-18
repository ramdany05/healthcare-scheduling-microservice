import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Schedule } from '../schedule/schedule.model';

@ObjectType({ description: 'Dokter yang melayani konsultasi' })
export class Doctor {
  @Field(() => ID, { description: 'Unique identifier' })
  id: string;

  @Field({ description: 'Nama lengkap dokter' })
  name: string;

  @Field({ description: 'Waktu pendaftaran' })
  createdAt: Date;

  @Field({ description: 'Waktu terakhir update' })
  updatedAt: Date;

  @Field(() => [Schedule], { nullable: true, description: 'Daftar jadwal milik dokter' })
  schedules?: Schedule[];
}
