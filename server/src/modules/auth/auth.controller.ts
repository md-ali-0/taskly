import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@common/auth/jwt-auth.guard';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { AuthResponse } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string; data: AuthResponse }> {
    const result = await this.authService.register(body);
    this.attachAuthCookies(response, result.accessToken, result.refreshToken);
    return {
      message: 'Registration successful',
      data: result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string; data: AuthResponse }> {
    const result = await this.authService.login(body);
    this.attachAuthCookies(response, result.accessToken, result.refreshToken);
    return {
      message: 'Login successful',
      data: result,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');

    return {
      message: 'Logout successful',
    };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() body: RefreshTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string; data: AuthResponse }> {
    const refreshToken =
      body.refreshToken ??
      this.getCookieValue(request.headers.cookie, 'refreshToken');

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const result = await this.authService.refreshAccessToken(refreshToken);
    this.attachAuthCookies(response, result.accessToken, result.refreshToken);
    return {
      message: 'Token refresh successful',
      data: result,
    };
  }

  @Post('verify-email')
  verifyEmail() {
    return this.authService.placeholderEmailFlow();
  }

  @Post('resend-verification')
  resendVerification() {
    return this.authService.placeholderEmailFlow();
  }

  @Post('forgot-password')
  forgotPassword() {
    return this.authService.placeholderEmailFlow();
  }

  @Post('reset-password')
  resetPassword() {
    return this.authService.placeholderEmailFlow();
  }

  private attachAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const secure = process.env.NODE_ENV === 'production';

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private getCookieValue(cookieHeader: string | undefined, key: string) {
    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(';').map((entry) => entry.trim());
    const match = cookies.find((cookie) => cookie.startsWith(`${key}=`));
    return match ? decodeURIComponent(match.slice(key.length + 1)) : null;
  }
}
