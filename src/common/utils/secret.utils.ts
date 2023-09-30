import { readFileSync } from 'fs';

const secretVolumePath = '/etc/secret-volume';

function getSecretValue(key: string) {
  if (!key) {
    return;
  }
  try {
    const value = readFileSync(`${secretVolumePath}/${key}`, 'utf8');
    return value;
  } catch (error: unknown) {
    console.error(error, `Secret ${key} not found in secret volume.`);
    return;
  }
}

export function getEnvValue(envKey: string) {
  if (process.env.NODE_ENV === 'docker-compose') {
    return process.env[envKey] as string;
  }
  return getSecretValue(envKey);
}
