import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'prisma/config';

// In development, attempt to load .env files so Prisma CLI commands (e.g.
// `prisma migrate dev`) work without a globally exported DATABASE_URL.
// In production (Railway and other container environments) environment
// variables are injected directly into process.env, so .env files are
// intentionally absent — we skip the file-loading step entirely and read
// DATABASE_URL straight from process.env.
function tryLoadEnvFile(filePath: string, override = false) {
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

    // Never overwrite a value that was already injected (e.g. by Railway).
    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

if (process.env.NODE_ENV !== 'production') {
  const devFiles = ['.env', '.env.local'];
  devFiles.forEach((file, index) => {
    tryLoadEnvFile(resolve(process.cwd(), file), index > 0);
  });
}

export default defineConfig({
  schema: 'prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
