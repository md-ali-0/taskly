export type TSession = {
  user?: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
  accessToken?: string | null;
  refreshToken?: string | null;
} | null;
