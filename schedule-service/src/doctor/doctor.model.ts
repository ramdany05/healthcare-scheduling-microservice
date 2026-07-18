import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Schedule } from '../schedule/schedule.model';

@ObjectType()
export class Doctor {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [Schedule], { nullable: true })
  schedules?: Schedule[];
}
