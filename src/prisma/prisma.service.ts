import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  /**
   * Connection is lazy. A database outage must not prevent the process from
   * starting, so GET /api/v1/health can answer 503.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
