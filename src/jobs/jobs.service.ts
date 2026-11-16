import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Job } from '@prisma/client';
import { optionalText, requiredText } from '../common/text';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, JobResponseDto } from './job.dto';
import { STARTER_JOBS } from './starter-jobs';

const STARTER_IDS = STARTER_JOBS.map((job) => job.id);

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    try {
      const existing = await this.prisma.job.count({
        where: { id: { in: STARTER_IDS } },
      });
      if (existing >= STARTER_JOBS.length) return;
      await this.prisma.job.createMany({
        data: STARTER_JOBS.map((job) => ({ ...job, source: 'starter', otherSupport: '' })),
        skipDuplicates: true,
      });
    } catch (error) {
      this.logger.error('Starter jobs were not seeded');
      this.logger.debug(error instanceof Error ? error.message : String(error));
    }
  }

  async list(): Promise<JobResponseDto[]> {
    const rows = await this.prisma.job.findMany();
    const starters = STARTER_IDS.flatMap((id) => {
      const row = rows.find((job) => job.id === id);
      return row ? [row] : [];
    });
    const posted = rows
      .filter((job) => job.source === 'posted')
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
    return [...posted, ...starters].map(toJobResponse);
  }

  async findOne(id: string): Promise<Job | null> {
    return this.prisma.job.findUnique({ where: { id } });
  }

  async create(dto: CreateJobDto): Promise<JobResponseDto> {
    const job = await this.prisma.job.create({
      data: {
        title: requiredText(dto.title, 'Title', 160),
        organization: requiredText(dto.organization, 'Company', 160),
        location: requiredText(dto.location, 'Location', 160),
        summary: requiredText(dto.summary, 'Description', 4000),
        supports: dto.supports,
        otherSupport: optionalText(dto.otherSupport, 240),
        source: 'posted',
      },
    });
    return toJobResponse(job);
  }
}

export function toJobResponse(job: Job): JobResponseDto {
  return {
    id: job.id,
    title: job.title,
    organization: job.organization,
    location: job.location,
    summary: job.summary,
    supports: job.supports,
    otherSupport: job.otherSupport,
    source: job.source,
    createdAt: job.createdAt.toISOString(),
  };
}
