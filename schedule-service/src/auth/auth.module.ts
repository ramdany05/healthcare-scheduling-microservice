import { Module, Global } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [AuthGuard],
  exports: [AuthGuard, HttpModule],
})
export class AuthModule {}
