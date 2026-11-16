import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AccountResponseDto, RegisterAccountDto, SignInDto } from './account.dto';
import { AccountsService } from './accounts.service';

@ApiTags('accounts')
@Controller()
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Post('accounts')
  @ApiOperation({ summary: 'Create an account' })
  @ApiCreatedResponse({ type: AccountResponseDto })
  @ApiConflictResponse({ description: 'Email is already registered' })
  register(@Body() dto: RegisterAccountDto): Promise<AccountResponseDto> {
    return this.accounts.register(dto);
  }

  @Post('sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({ type: AccountResponseDto })
  @ApiUnauthorizedResponse({ description: 'Email or password is not recognized' })
  signIn(@Body() dto: SignInDto): Promise<AccountResponseDto> {
    return this.accounts.signIn(dto);
  }
}
