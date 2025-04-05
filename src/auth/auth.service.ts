import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { Response } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { ExtendedRequest } from './auth.controller';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<{ id: string; email: string }> {
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

  async login(
    userId: string,
    res: Response,
  ): Promise<{ message: string; userId: string; accessToken: string }> {
    const { refreshToken, accessToken } = await this.generateTokens(userId);

    const hashedRefreshToken = await hash(refreshToken);

    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);

    this.cookieGenerator(res, accessToken, refreshToken);

    return { message: 'Login successful', userId, accessToken };
  }

  async refresh(
    res: Response,
    req: ExtendedRequest,
  ): Promise<{ userId: string; accessToken: string }> {
    try {
      const refreshToken = req.cookies['RefreshToken'];

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
      });

      const userId = decoded.sub;

      const storedHashedRefreshToken =
        await this.usersService.getRefreshToken(userId);

      if (!storedHashedRefreshToken) {
        throw new UnauthorizedException('Refresh token expired or invalid');
      }

      const isRefreshTokenValid = await verify(
        storedHashedRefreshToken,
        refreshToken,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const { refreshToken: newRefreshToken, accessToken } =
        await this.generateTokens(userId);
      const hashedNewRefreshToken = await hash(newRefreshToken);

      await this.usersService.updateRefreshToken(userId, hashedNewRefreshToken);

      this.cookieGenerator(res, accessToken, newRefreshToken);

      return { userId, accessToken };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(): Promise<{ message: string }> {
    return { message: 'Logout successful' };
  }

  private async generateTokens(
    userId: string,
  ): Promise<{ refreshToken: string; accessToken: string }> {
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

  async validateJwt(userId: string): Promise<{ id: string; email: string }> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { id: user.id, email: user.email };
  }

  private cookieGenerator(
    res: Response<any, Record<string, any>>,
    accessToken: string,
    newRefreshToken?: string,
  ) {
    res.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
    });

    if (newRefreshToken) {
      res.cookie('RefreshToken', newRefreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });
    }
  }
}
