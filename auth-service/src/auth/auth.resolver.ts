import { Resolver, Mutation, Query, Args, ObjectType, Field } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from '../user/user.model';

@ObjectType({ description: 'Response untuk login berisi access token dan data user' })
class LoginResponse {
  @Field({ description: 'JWT access token' })
  accessToken: string;

  @Field(() => User, { description: 'Data user yang login' })
  user: User;
}

@ObjectType({ description: 'Response untuk validasi token' })
class ValidateTokenResponse {
  @Field({ description: 'Apakah token valid' })
  valid: boolean;

  @Field(() => User, { description: 'Data user dari token' })
  user: User;
}

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => User, { description: 'Registrasi user baru dengan email dan password' })
  async register(
    @Args('email', { description: 'Email (harus unique)' }) email: string,
    @Args('password', { description: 'Password (minimal 6 karakter)' }) password: string,
  ) {
    return this.authService.register(email, password);
  }

  @Mutation(() => LoginResponse, { description: 'Login dan dapatkan JWT access token' })
  async login(
    @Args('email', { description: 'Email terdaftar' }) email: string,
    @Args('password', { description: 'Password' }) password: string,
  ) {
    return this.authService.login(email, password);
  }

  @Query(() => ValidateTokenResponse, { description: 'Validasi JWT token untuk cross-service auth' })
  async validateToken(
    @Args('token', { description: 'JWT token yang akan divalidasi' }) token: string,
  ) {
    return this.authService.validateToken(token);
  }
}
