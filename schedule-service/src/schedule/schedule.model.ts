import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Customer } from '../customer/customer.model';
import { Doctor } from '../doctor/doctor.model';

@ObjectType()
export class Schedule {
  @Field(() => ID)
  id: string;

  @Field()
  objective: string;

  @Field()
  customerId: string;

  @Field()
  doctorId: string;

  @Field()
  scheduledAt: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Customer)
  customer?: Customer;

  @Field(() => Doctor)
  doctor?: Doctor;
}
