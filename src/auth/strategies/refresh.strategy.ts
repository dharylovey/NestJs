import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

export type AuthJwtPayload = {
  sub: string;
};
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const jwtSecret = configService.get<string>('REFRESH_JWT_SECRET');
    if (!jwtSecret) {
      throw new UnauthorizedException(
        'REFRESH_JWT_SECRET is not defined in the environment variables',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.RefreshToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: AuthJwtPayload) {
    const userId = payload.sub;
    return await this.authService.validateJwt(userId);
  }
}
