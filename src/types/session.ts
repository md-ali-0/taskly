export type TSession = {
  isAuth?: boolean;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  profile?: Record<string, unknown> | null;
} | null;
