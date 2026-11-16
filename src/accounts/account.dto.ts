import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterAccountDto {
  @ApiProperty({ example: 'Hana Bekele' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: 'hana@example.com' })
  @IsEmail()
  @MaxLength(160)
  email!: string;

  @ApiProperty({ example: 'a-long-password' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  password!: string;
}

export class SignInDto {
  @ApiProperty({ example: 'hana@example.com' })
  @IsEmail()
  @MaxLength(160)
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  password!: string;
}

export class AccountResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;
}
