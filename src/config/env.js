import 'dotenv/config';

export function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta configurar la variable de entorno ${name}.`);
  }
  return value;
}

export function validateEnvironment() {
  getRequiredEnv('DATABASE_URL');
  const secret = getRequiredEnv('JWT_SECRET');
  if (secret.length < 32 || secret.includes('replace-with')) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres y ser único.');
  }
  const origins = getAllowedOrigins();
  if (origins.length === 0 || origins.includes('*')) {
    throw new Error('CORS_ORIGINS debe incluir al menos un origen explícito y no puede ser "*".');
  }
}

export function getAllowedOrigins() {
  return getRequiredEnv('CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
