import { Role } from '@prisma/client';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: Role;
  roles: Role[];
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}

export interface AuthenticatedUser extends AccessTokenPayload {
  name?: string | null;
  status?: string;
}
