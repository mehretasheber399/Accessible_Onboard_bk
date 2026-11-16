import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from './jobs.service';

describe('JobsService', () => {
  const count = jest.fn();
  const createMany = jest.fn();
  const findMany = jest.fn();
  const create = jest.fn();
  const prisma = {
    job: { count, createMany, findMany, create },
  } as unknown as PrismaService;
  const service = new JobsService(prisma);

  beforeEach(() => {
    count.mockReset();
    createMany.mockReset();
    findMany.mockReset();
    create.mockReset();
  });

  it('seeds the career starter jobs once', async () => {
    count.mockResolvedValue(0);
    createMany.mockResolvedValue({ count: 4 });

    await service.onModuleInit();

    expect(createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ id: 'customer-support-assistant', source: 'starter' }),
        expect.objectContaining({ id: 'community-guide', source: 'starter' }),
      ]),
      skipDuplicates: true,
    });
  });

  it('lists employer posts before starter jobs', async () => {
    findMany.mockResolvedValue([
      row('workshop-assistant', 'starter', '2026-01-01T00:00:00.000Z'),
      row('posted-1', 'posted', '2026-02-01T00:00:00.000Z'),
      row('customer-support-assistant', 'starter', '2026-01-01T00:00:00.000Z'),
      row('junior-data-clerk', 'starter', '2026-01-01T00:00:00.000Z'),
      row('community-guide', 'starter', '2026-01-01T00:00:00.000Z'),
      row('posted-2', 'posted', '2026-03-01T00:00:00.000Z'),
    ]);

    const jobs = await service.list();

    expect(jobs.map((job) => job.id)).toEqual([
      'posted-2',
      'posted-1',
      'customer-support-assistant',
      'junior-data-clerk',
      'workshop-assistant',
      'community-guide',
    ]);
  });

  it('saves an employer post', async () => {
    create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      ...row('job-9', 'posted', '2026-04-01T00:00:00.000Z'),
      ...data,
      id: 'job-9',
      createdAt: new Date('2026-04-01T00:00:00.000Z'),
    }));

    const job = await service.create({
      title: ' Guide ',
      organization: 'Selam',
      location: 'Remote',
      summary: 'Write updates.',
      supports: ['written'],
      otherSupport: ' Quiet room ',
    });

    expect(job).toEqual(
      expect.objectContaining({
        id: 'job-9',
        title: 'Guide',
        otherSupport: 'Quiet room',
        source: 'posted',
        supports: ['written'],
      }),
    );
  });
});

function row(id: string, source: string, createdAt: string) {
  return {
    id,
    title: id,
    organization: 'Selam',
    location: 'Addis Ababa',
    summary: 'Help people.',
    supports: ['written'],
    otherSupport: '',
    source,
    createdAt: new Date(createdAt),
  };
}
