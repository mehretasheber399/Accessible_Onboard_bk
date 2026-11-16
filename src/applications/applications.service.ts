import { Injectable, NotFoundException } from '@nestjs/common';
import { Application, Prisma } from '@prisma/client';
import { optionalText, requiredText } from '../common/text';
import { PrismaService } from '../prisma/prisma.service';
import {
  ApplicationResponseDto,
  CreateApplicationDto,
  CreateGatewayApplicationDto,
} from './application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createForJob(jobId: string, dto: CreateGatewayApplicationDto): Promise<ApplicationResponseDto> {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('That job is not on the board.');
    }
    const saved = await this.insert({
      jobId: job.id,
      jobTitle: job.title,
      employer: job.organization,
      name: requiredText(dto.name, 'Name', 160),
      phone: requiredText(dto.phone, 'Phone or email', 160),
      experience: requiredText(dto.experience, 'Experience', 4000),
      education: '',
      skills: '',
      cvName: '',
      kind: 'gateway',
    });
    return toApplicationResponse(saved);
  }

  async createFull(dto: CreateApplicationDto): Promise<ApplicationResponseDto> {
    const jobId = dto.jobId?.trim() || null;
    const linked = jobId ? await this.prisma.job.findUnique({ where: { id: jobId } }) : null;
    const saved = await this.insert({
      jobId: linked?.id ?? null,
      jobTitle: requiredText(dto.jobTitle, 'Job title', 160),
      employer: requiredText(dto.employer, 'Employer', 160),
      name: requiredText(dto.name, 'Name', 160),
      phone: requiredText(dto.phone, 'Phone', 160),
      experience: requiredText(dto.experience, 'Experience', 4000),
      education: optionalText(dto.education, 4000),
      skills: optionalText(dto.skills, 4000),
      cvName: optionalText(dto.cvName, 240),
      kind: 'full',
    });
    return toApplicationResponse(saved);
  }

  async listForJob(jobId: string): Promise<ApplicationResponseDto[]> {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('That job is not on the board.');
    }
    const rows = await this.prisma.application.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toApplicationResponse);
  }

  private async insert(input: {
    jobId: string | null;
    jobTitle: string;
    employer: string;
    name: string;
    phone: string;
    experience: string;
    education: string;
    skills: string;
    cvName: string;
    kind: string;
  }) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return await this.prisma.application.create({
          data: {
            jobTitle: input.jobTitle,
            employer: input.employer,
            name: input.name,
            phone: input.phone,
            experience: input.experience,
            education: input.education,
            skills: input.skills,
            cvName: input.cvName,
            kind: input.kind,
            reference: nextReference(),
            ...(input.jobId ? { job: { connect: { id: input.jobId } } } : {}),
          },
        });
      } catch (error) {
        if (!isUniqueViolation(error) || attempt === 4) throw error;
      }
    }
    throw new Error('Could not assign an application reference');
  }
}

function nextReference(): string {
  const number = 1000 + Math.floor(Math.random() * 9000);
  return `OP-JOB-${number}`;
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export function toApplicationResponse(row: Application): ApplicationResponseDto {
  return {
    id: row.id,
    reference: row.reference,
    jobId: row.jobId,
    jobTitle: row.jobTitle,
    employer: row.employer,
    name: row.name,
    phone: row.phone,
    experience: row.experience,
    education: row.education,
    skills: row.skills,
    cvName: row.cvName,
    kind: row.kind,
    createdAt: row.createdAt.toISOString(),
  };
}
