import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { appConfig } from '@common/config/app.config';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from './jwt-payload.interface';

type JwtDuration = NonNullable<SignOptions['expiresIn']>;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }

  return secret;
}

export function generateAccessToken(payload: AccessTokenPayload) {
  const options: SignOptions = {
    expiresIn: (process.env.ACCESS_TOKEN_EXPIRATION ?? '1h') as JwtDuration,
    issuer: appConfig.appName,
  };

  return jwt.sign(payload, getJwtSecret(), options);
}

export function generateRefreshToken(payload: RefreshTokenPayload) {
  const options: SignOptions = {
    expiresIn: (process.env.REFRESH_TOKEN_EXPIRATION ?? '7d') as JwtDuration,
    issuer: appConfig.appName,
  };

  return jwt.sign(payload, getRefreshSecret(), options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
  } catch {
    throw new UnauthorizedException('Invalid access token');
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, getRefreshSecret()) as RefreshTokenPayload;
  } catch {
    throw new UnauthorizedException('Invalid refresh token');
  }
}

export function normalizeRole(role?: string): Role {
  return role === Role.ADMIN ? Role.ADMIN : Role.USER;
}
