import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationsService } from './applications.service';

describe('ApplicationsService', () => {
  const findUnique = jest.fn();
  const create = jest.fn();
  const findMany = jest.fn();
  const prisma = {
    job: { findUnique },
    application: { create, findMany },
  } as unknown as PrismaService;
  const service = new ApplicationsService(prisma);

  beforeEach(() => {
    findUnique.mockReset();
    create.mockReset();
    findMany.mockReset();
  });

  it('stores a career application against the posted job', async () => {
    findUnique.mockResolvedValue({
      id: 'job-1',
      title: 'Guide',
      organization: 'Selam',
    });
    create.mockResolvedValue(savedRow());

    const result = await service.createForJob('job-1', {
      name: ' Hana ',
      phone: '0911',
      experience: 'Campus desk',
    });

    expect(result.reference).toMatch(/^OP-JOB-\d{4}$/);
    expect(result.kind).toBe('gateway');
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Hana',
        phone: '0911',
        experience: 'Campus desk',
        kind: 'gateway',
        job: { connect: { id: 'job-1' } },
      }),
    });
  });

  it('returns 404 when the job is missing', async () => {
    findUnique.mockResolvedValue(null);
    await expect(
      service.createForJob('missing', { name: 'Hana', phone: '0911', experience: 'Desk' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('stores a full application even when the job id is not on the board', async () => {
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({ ...savedRow(), kind: 'full', education: 'School', skills: 'Writing', cvName: 'cv.docx' });

    const result = await service.createFull({
      jobId: 'missing',
      jobTitle: 'Guide',
      employer: 'Selam',
      name: 'Hana',
      phone: '0911',
      experience: 'Desk',
      education: 'School',
      skills: 'Writing',
      cvName: 'cv.docx',
    });

    expect(result.kind).toBe('full');
    const data = create.mock.calls[0][0].data as { education: string; cvName: string; job?: unknown };
    expect(data.education).toBe('School');
    expect(data.cvName).toBe('cv.docx');
    expect(data.job).toBeUndefined();
  });

  it('retries when the reference is already used', async () => {
    findUnique.mockResolvedValue({ id: 'job-1', title: 'Guide', organization: 'Selam' });
    create
      .mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: '6' }))
      .mockResolvedValueOnce(savedRow());

    await expect(
      service.createForJob('job-1', { name: 'Hana', phone: '0911', experience: 'Desk' }),
    ).resolves.toEqual(expect.objectContaining({ id: 'app-1' }));
    expect(create).toHaveBeenCalledTimes(2);
  });
});

function savedRow() {
  return {
    id: 'app-1',
    reference: 'OP-JOB-1111',
    jobId: 'job-1',
    jobTitle: 'Guide',
    employer: 'Selam',
    name: 'Hana',
    phone: '0911',
    experience: 'Desk',
    education: '',
    skills: '',
    cvName: '',
    kind: 'gateway',
    createdAt: new Date('2026-11-15T00:00:00.000Z'),
  };
}
