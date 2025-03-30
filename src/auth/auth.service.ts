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
import { RedisService } from '../redis/redis.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { ExtendedRequest } from './auth.controller';

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
    const { refreshToken, accessToken } = await this.generateTokens(userId);
    console.log('Refresh Token:', refreshToken);
    console.log('Access Token:', accessToken);

    console.log(`Setting Redis Key: refreshToken:${userId}`);
    await this.redisService.set(`refreshToken:${userId}`, refreshToken, 60 * 60 * 24 * 30); // 30 day

    console.log(`Fetching Redis Key: refreshToken:${userId}`);
    await this.redisService.get(`refreshToken:${userId}`);

    this.cookieGenerator(res, accessToken, refreshToken);

    return { userId, accessToken, refreshToken };
  }

  async refresh(res: Response, req: ExtendedRequest) {
    try {
      console.log('Refresh Token:', req.cookies.RefreshToken);
      const refreshToken = req.cookies['RefreshToken'];

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
      });

      const userId = decoded.sub;
      console.log('Decoded User ID from Refresh Token:', userId);

      const storedRefreshToken = await this.redisService.get(`refreshToken:${userId}`);
      console.log(`Fetching Redis Key: refreshToken:${userId}`);

      // Check if the stored token matches
      if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid or reused refresh token');
      }

      // Immediately invalidate the old refresh token
      await this.redisService.del(`refreshToken:${userId}`);

      // Generate a new refresh and access token
      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(userId);

      // Store the new refresh token in Redis
      await this.redisService.set(`refreshToken:${userId}`, newRefreshToken, 60 * 60 * 24 * 30);

      // Set new cookies
      this.cookieGenerator(res, accessToken, newRefreshToken);

      return { userId, accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.redisService.del(`refreshToken:${userId}`);
  }

  private async generateTokens(userId: string) {
    const [refreshToken, accessToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
          expiresIn: this.configService.get<string>('REFRESH_JWT_EXPIRES_IN'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
        },
      ),
    ]);
    return { refreshToken, accessToken };
  }

  private cookieGenerator(
    res: Response<any, Record<string, any>>,
    accessToken: string,
    newRefreshToken: string,
  ) {
    res.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
    });

    res.cookie('RefreshToken', newRefreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });
  }

  async validateJwt(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { id: user.id, email: user.email };
  }
}
