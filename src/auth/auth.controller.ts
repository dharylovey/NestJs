import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { LocalGuard } from './guards/locel.guard';
import { LoginUserDto } from './dto/login-user.dto';

export interface ExtendedRequest extends Request {
  user: { id: string; email: string };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }
  @UseGuards(LocalGuard)
  @Post('login')
  async login(
    @Body() body: LoginUserDto,
    @Req() req: ExtendedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.login(req.user.id, res);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: ExtendedRequest) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    res.clearCookie('Authentication');
    await this.authService.logout(req.user.id);
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtGuard)
  @Post('refresh')
  async refresh(@Req() req: ExtendedRequest, @Res() res: Response) {
    const data = await this.authService.refresh(res, req);
    return res.json({
      message: 'Refresh successful',
      data: {
        userId: data.userId,
        accessToken: data.accessToken,
      },
    });
  }

  @UseGuards(JwtGuard)
  @Get('session')
  session(@Req() req: ExtendedRequest) {
    console.log(req.cookies.Authentication);
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return { message: 'Valid session', user: req.user };
  }
}
