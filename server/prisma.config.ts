import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'prisma/config';

const envFilesByMode: Record<string, string[]> = {
  development: ['.env', '.env.local'],
  production: ['.env', '.env.production'],
  test: ['.env'],
};

function loadEnvFile(filePath: string, override = false) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const envFiles = envFilesByMode[nodeEnv] ?? ['.env'];

envFiles.forEach((file, index) => {
  loadEnvFile(resolve(process.cwd(), file), index > 0);
});

// Prisma generate runs during the Docker build, where Railway may not inject
// runtime-only variables yet. Use a harmless placeholder for build-time config.
const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://placeholder:placeholder@localhost:5432/taskly_build';

export default defineConfig({
  schema: 'prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});
