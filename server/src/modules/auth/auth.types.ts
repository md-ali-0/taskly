import { Role } from '@prisma/client';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    roles: Role[];
    status: string;
    emailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}
