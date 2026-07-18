import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Schedule } from '../schedule/schedule.model';

@ObjectType({ description: 'Customer / pasien yang membuat jadwal konsultasi' })
export class Customer {
  @Field(() => ID, { description: 'Unique identifier' })
  id: string;

  @Field({ description: 'Nama lengkap customer' })
  name: string;

  @Field({ description: 'Email (unique)' })
  email: string;

  @Field({ description: 'Waktu pendaftaran' })
  createdAt: Date;

  @Field({ description: 'Waktu terakhir update' })
  updatedAt: Date;

  @Field(() => [Schedule], { nullable: true, description: 'Daftar jadwal milik customer' })
  schedules?: Schedule[];
}
