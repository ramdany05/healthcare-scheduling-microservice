import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'User akun untuk autentikasi' })
export class User {
  @Field(() => ID, { description: 'Unique identifier' })
  id: string;

  @Field({ description: 'Email (unique)' })
  email: string;

  @Field({ description: 'Waktu pendaftaran' })
  createdAt: Date;

  @Field({ description: 'Waktu terakhir update' })
  updatedAt: Date;
}
