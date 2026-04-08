const FALLBACK_PORT = 5000;
const FALLBACK_API_PREFIX = 'api/v1';

function parseOrigins(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const appConfig = {
  get appName() {
    return process.env.APP_NAME ?? 'Taskly API';
  },
  get version() {
    return process.env.APP_VERSION ?? '1.0.0';
  },
  get nodeEnv() {
    return process.env.NODE_ENV ?? 'development';
  },
  get port() {
    return Number.parseInt(process.env.PORT ?? `${FALLBACK_PORT}`, 10);
  },
  get apiPrefix() {
    return (process.env.API_PREFIX ?? FALLBACK_API_PREFIX).replace(/^\/+/, '');
  },
  get corsOrigins() {
    return parseOrigins(process.env.CORS_ORIGIN);
  },
  get databaseUrl() {
    return process.env.DATABASE_URL ?? '';
  },
  get redisHost() {
    return process.env.REDIS_HOST ?? '';
  },
  get redisPort() {
    return process.env.REDIS_PORT ?? '';
  },
};
