import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { requiredText } from '../common/text';
import { PrismaService } from '../prisma/prisma.service';
import { AccountResponseDto, RegisterAccountDto, SignInDto } from './account.dto';
import { hashPassword, verifyPassword } from './password';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterAccountDto): Promise<AccountResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await hashPassword(dto.password);
    try {
      const account = await this.prisma.account.create({
        data: {
          name: requiredText(dto.name, 'Full name', 160),
          email,
          passwordHash,
        },
      });
      return toAccount(account);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('An account with this email already exists.');
      }
      throw error;
    }
  }

  async signIn(dto: SignInDto): Promise<AccountResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const account = await this.prisma.account.findUnique({ where: { email } });
    if (!account) {
      throw new UnauthorizedException('No account uses this email. Choose Register to save one.');
    }
    const matches = await verifyPassword(dto.password, account.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Email or password is not recognized.');
    }
    return toAccount(account);
  }
}

function toAccount(account: { id: string; name: string; email: string }): AccountResponseDto {
  return { id: account.id, name: account.name, email: account.email };
}
