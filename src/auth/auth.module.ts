import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/locel.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [UsersModule, DatabaseModule, JwtModule, RedisModule],
  providers: [AuthService, LocalStrategy, LocalGuard, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
