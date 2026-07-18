import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      const authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL');
      
      const response = await firstValueFrom(
        this.httpService.post(authServiceUrl!, {
          query: `
            query ValidateToken($token: String!) {
              validateToken(token: $token) {
                valid
                user {
                  id
                  email
                }
              }
            }
          `,
          variables: { token },
        }),
      );

      const result = response.data;

      if (result.errors || !result.data?.validateToken?.valid) {
        throw new UnauthorizedException('Invalid token');
      }

      req.user = result.data.validateToken.user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to validate token');
    }
  }
}
