import { nestLogLevels, validateEnv } from './env.schema';

const validEnv = {
  NODE_ENV: 'test',
  PORT: '3001',
  DATABASE_URL: 'postgresql://openpath:openpath@localhost:5432/openpath?schema=public',
  LOG_LEVEL: 'debug',
};

describe('validateEnv', () => {
  it('accepts the local development environment', () => {
    expect(validateEnv(validEnv)).toEqual({
      NODE_ENV: 'test',
      PORT: 3001,
      DATABASE_URL: validEnv.DATABASE_URL,
      LOG_LEVEL: 'debug',
    });
  });

  it('applies defaults for optional variables', () => {
    expect(
      validateEnv({
        DATABASE_URL: 'postgres://openpath:openpath@localhost:5432/openpath',
      }),
    ).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3001,
      LOG_LEVEL: 'log',
    });
  });

  it('rejects a missing database URL', () => {
    expect(() => validateEnv({ PORT: '3000' })).toThrow(/DATABASE_URL/);
  });

  it('rejects a non-PostgreSQL database URL', () => {
    expect(() =>
      validateEnv({ ...validEnv, DATABASE_URL: 'mysql://localhost/openpath' }),
    ).toThrow(/DATABASE_URL/);
  });

  it('rejects an invalid port', () => {
    expect(() => validateEnv({ ...validEnv, PORT: '0' })).toThrow(/PORT/);
    expect(() => validateEnv({ ...validEnv, PORT: '65536' })).toThrow(/PORT/);
    expect(() => validateEnv({ ...validEnv, PORT: 'abc' })).toThrow(/PORT/);
  });

  it('rejects an unknown node environment', () => {
    expect(() => validateEnv({ ...validEnv, NODE_ENV: 'staging' })).toThrow(
      /NODE_ENV/,
    );
  });

  it('rejects an unknown log level', () => {
    expect(() => validateEnv({ ...validEnv, LOG_LEVEL: 'trace' })).toThrow(
      /LOG_LEVEL/,
    );
  });
});

describe('nestLogLevels', () => {
  it('includes every level up to the configured threshold', () => {
    expect(nestLogLevels('error')).toEqual(['error']);
    expect(nestLogLevels('log')).toEqual(['error', 'warn', 'log']);
    expect(nestLogLevels('verbose')).toEqual([
      'error',
      'warn',
      'log',
      'debug',
      'verbose',
    ]);
  });
});
