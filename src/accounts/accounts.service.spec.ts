import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from './accounts.service';
import { hashPassword } from './password';

describe('AccountsService', () => {
  const create = jest.fn();
  const findUnique = jest.fn();
  const prisma = { account: { create, findUnique } } as unknown as PrismaService;
  const service = new AccountsService(prisma);

  beforeEach(() => {
    create.mockReset();
    findUnique.mockReset();
  });

  it('stores a hashed password and returns the account without it', async () => {
    create.mockImplementation(async ({ data }: { data: { passwordHash: string } }) => ({
      id: 'acc-1',
      name: 'Hana Bekele',
      email: 'hana@example.com',
      passwordHash: data.passwordHash,
    }));

    const result = await service.register({
      name: ' Hana Bekele ',
      email: 'Hana@Example.com',
      password: 'secret-pass',
    });

    expect(result).toEqual({ id: 'acc-1', name: 'Hana Bekele', email: 'hana@example.com' });
    const stored = create.mock.calls[0][0].data.passwordHash as string;
    expect(stored.startsWith('scrypt$')).toBe(true);
    expect(stored).not.toContain('secret-pass');
  });

  it('returns 409 when the email is already registered', async () => {
    create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: '6' }));
    await expect(
      service.register({ name: 'Hana', email: 'hana@example.com', password: 'secret-pass' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('signs in when the password matches', async () => {
    findUnique.mockResolvedValue({
      id: 'acc-1',
      name: 'Hana',
      email: 'hana@example.com',
      passwordHash: await hashPassword('secret-pass'),
    });

    await expect(service.signIn({ email: 'hana@example.com', password: 'secret-pass' })).resolves.toEqual({
      id: 'acc-1',
      name: 'Hana',
      email: 'hana@example.com',
    });
  });

  it('tells a new email to register before signing in', async () => {
    findUnique.mockResolvedValue(null);

    await expect(service.signIn({ email: 'new.learner@example.com', password: 'secret-pass' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('returns 401 when the password does not match the saved account', async () => {
    findUnique.mockResolvedValue({
      id: 'acc-1',
      name: 'Hana',
      email: 'hana@example.com',
      passwordHash: await hashPassword('secret-pass'),
    });
    await expect(service.signIn({ email: 'hana@example.com', password: 'wrong' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
