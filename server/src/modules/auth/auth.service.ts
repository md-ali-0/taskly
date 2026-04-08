import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PasswordUtil } from '@common/auth/password.util';
import {
  generateAccessToken,
  generateRefreshToken,
  normalizeRole,
  verifyRefreshToken,
} from '@common/auth/jwt.util';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import type { AuthResponse } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const authUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  emailVerified: true,
  tokenVersion: true,
  deletedAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(body: RegisterDto): Promise<AuthResponse> {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password are required');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await PasswordUtil.hashPassword(body.password);
    const role = normalizeRole(body.userType);

    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        passwordHash,
        role,
        status: 'ACTIVE',
      },
      select: authUserSelect,
    });

    return this.createAuthResponse(user);
  }

  async login(body: LoginDto): Promise<AuthResponse> {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
      select: {
        ...authUserSelect,
        passwordHash: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await PasswordUtil.comparePassword(
      body.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is inactive');
    }

    return this.createAuthResponse(user);
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.userId },
      select: authUserSelect,
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (decoded.tokenVersion !== (user.tokenVersion ?? 0)) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    return this.createAuthResponse(user);
  }

  placeholderEmailFlow(): never {
    throw new NotImplementedException(
      'Email verification and password reset flows are scheduled for a later migration phase',
    );
  }

  private createAuthResponse(user: {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    status: string;
    emailVerified: boolean;
    tokenVersion: number;
  }): AuthResponse {
    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      roles: [user.role],
      status: user.status,
      emailVerified: user.emailVerified,
    };

    return {
      user: userPayload,
      accessToken: generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        roles: [user.role],
      }),
      refreshToken: generateRefreshToken({
        userId: user.id,
        tokenVersion: user.tokenVersion ?? 0,
      }),
    };
  }
}
