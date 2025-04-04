import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerProxyGuard } from 'src/throttler-guard';
import { UsersModule } from 'src/users/users.module';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/locel.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    JwtModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60, // 60 seconds
          limit: 10,
        },
      ],
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    LocalGuard,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: ThrottlerProxyGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
