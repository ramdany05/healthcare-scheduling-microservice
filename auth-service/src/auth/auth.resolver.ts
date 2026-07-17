import { Resolver, Mutation, Query, Args, ObjectType, Field } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from '../user/user.model';

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}

@ObjectType()
class ValidateTokenResponse {
  @Field()
  valid: boolean;

  @Field(() => User)
  user: User;
}

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => User)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.authService.register(email, password);
  }

  @Mutation(() => LoginResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.authService.login(email, password);
  }

  @Query(() => ValidateTokenResponse)
  async validateToken(@Args('token') token: string) {
    return this.authService.validateToken(token);
  }
}
