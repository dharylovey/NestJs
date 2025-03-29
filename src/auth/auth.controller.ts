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
    console.log(body);
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
  async refresh(@Body('userId') userId: string, @Res() res: Response) {
    const tokens = await this.authService.refresh(userId, res);
    return res.json(tokens);
  }

  @UseGuards(JwtGuard)
  @Get('session')
  session() {
    return { message: 'Session is valid' };
  }
}
