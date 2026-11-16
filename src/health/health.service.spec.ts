import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const queryRaw = jest.fn();
  const prisma = { $queryRaw: queryRaw } as unknown as PrismaService;
  const service = new HealthService(prisma);

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  beforeEach(() => {
    queryRaw.mockReset();
  });

  it('returns ok when SELECT 1 succeeds', async () => {
    queryRaw.mockResolvedValue([{ ok: 1 }]);

    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      checks: { database: 'up' },
    });

    const statement = queryRaw.mock.calls[0][0] as string[];
    expect(statement[0]).toContain('SELECT 1 AS ok');
  });

  it('returns 503 when the query fails', async () => {
    queryRaw.mockRejectedValue(new Error('connect ECONNREFUSED'));

    const error = await service.check().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect((error as ServiceUnavailableException).getStatus()).toBe(503);
    expect((error as ServiceUnavailableException).getResponse()).toEqual({
      status: 'error',
      checks: { database: 'down' },
    });
  });

  it('returns 503 when SELECT 1 does not come back as 1', async () => {
    queryRaw.mockResolvedValue([{ ok: 0 }]);

    await expect(service.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
