import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthResponseDto } from './health.response';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthResponseDto> {
    try {
      const rows = await this.prisma.$queryRaw<Array<{ ok: number }>>`
        SELECT 1 AS ok
      `;
      if (Number(rows[0]?.ok) !== 1) {
        throw new Error('Unexpected database health check result');
      }
      return { status: 'ok', checks: { database: 'up' } };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      this.logger.error('Database health check failed');
      throw new ServiceUnavailableException({
        status: 'error',
        checks: { database: 'down' },
      });
    }
  }
}
