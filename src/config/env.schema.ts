import { LogLevel } from '@nestjs/common';
import { z } from 'zod';

const LOG_LEVELS = ['error', 'warn', 'log', 'debug', 'verbose'] as const;

const postgresUrl = z
  .string()
  .regex(
    /^postgres(ql)?:\/\/\S+$/,
    'DATABASE_URL must be a PostgreSQL connection URL',
  );

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.preprocess(
    (value) => (value === undefined ? '3001' : value),
    z
      .string()
      .regex(/^\d+$/, 'PORT must be an integer')
      .transform((value) => Number.parseInt(value, 10))
      .refine(
        (value) => value >= 1 && value <= 65535,
        'PORT must be between 1 and 65535',
      ),
  ),
  DATABASE_URL: postgresUrl,
  LOG_LEVEL: z.enum(LOG_LEVELS).default('log'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(input: unknown): Env {
  const parsed = envSchema.safeParse(input);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => {
        const path = issue.path.join('.') || 'env';
        return `${path}: ${issue.message}`;
      })
      .join('; ');
    throw new Error(`Invalid environment: ${details}`);
  }
  return parsed.data;
}

export function nestLogLevels(level: Env['LOG_LEVEL']): LogLevel[] {
  const index = LOG_LEVELS.indexOf(level);
  return [...LOG_LEVELS.slice(0, index + 1)];
}
