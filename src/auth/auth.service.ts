import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { Response } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}
  async register(createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { id: user.id, email: user.email };
  }

  async login(userId: string, res: Response) {
    const payload = { sub: userId };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_JWT_EXPIRES_IN'),
    });

    await this.redisService.set(`refreshToken:${userId}`, refreshToken, 60 * 60 * 24 * 30); // 30 days
    const storedToken = await this.redisService.get(`refreshToken:${userId}`);

    res.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // 1 day
    });

    return { userId, accessToken };
  }

  async refresh(userId: string, res: Response) {
    const refreshToken = await this.redisService.get(`refreshToken:${userId}`);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const payload = { sub: userId };
    const newAccessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });

    res.cookie('Authentication', newAccessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // 1 day
    });

    return { userId, accessToken: newAccessToken };
  }

  async validateJwt(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { id: user.id, email: user.email };
  }

  async logout(userId: string) {
    await this.redisService.del(`refreshToken:${userId}`);
  }
}
