import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const parsedEnvFiles = new Set<string>();

const ENV_FILE_BY_MODE: Record<string, string[]> = {
  development: ['.env', '.env.local'],
  production: ['.env', '.env.production'],
  test: ['.env'],
};

function parseLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }

  const separatorIndex = trimmed.indexOf('=');
  if (separatorIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

function loadEnvFile(filePath: string, override = false) {
  if (!existsSync(filePath) || parsedEnvFiles.has(filePath)) {
    return;
  }

  const content = readFileSync(filePath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const parsed = parseLine(line);

    if (!parsed) {
      continue;
    }

    if (override || process.env[parsed.key] === undefined) {
      process.env[parsed.key] = parsed.value;
    }
  }

  parsedEnvFiles.add(filePath);
}

export function loadEnvironment() {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const files = ENV_FILE_BY_MODE[nodeEnv] ?? ['.env'];

  files.forEach((file, index) => {
    loadEnvFile(resolve(process.cwd(), file), index > 0);
  });
}
