export type TSession = {
  isAuth?: boolean;
  user?: {
    id?: string;
    name?: string | null;
    email?: string;
    role?: string;
    roles?: string[];
    status?: string;
    emailVerified?: boolean;
  } | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  profile?: Record<string, unknown> | null;
} | null;
