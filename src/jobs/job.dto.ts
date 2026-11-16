import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayUnique, IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SUPPORT_IDS } from './starter-jobs';

export class CreateJobDto {
  @ApiProperty({ example: 'Community Guide' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @ApiProperty({ example: 'Selam Connect' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  organization!: string;

  @ApiProperty({ example: 'Addis Ababa · Hybrid' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  location!: string;

  @ApiProperty({ example: 'Share updates in writing with a small team.' })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  summary!: string;

  @ApiProperty({ enum: SUPPORT_IDS, isArray: true, example: ['written', 'flexible'] })
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(SUPPORT_IDS.length)
  @IsIn(SUPPORT_IDS, { each: true })
  supports!: string[];

  @ApiPropertyOptional({ example: 'Quiet workspace' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  otherSupport?: string;
}

export class JobResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  organization!: string;

  @ApiProperty()
  location!: string;

  @ApiProperty()
  summary!: string;

  @ApiProperty({ enum: SUPPORT_IDS, isArray: true })
  supports!: string[];

  @ApiProperty()
  otherSupport!: string;

  @ApiProperty({ enum: ['posted', 'starter'] })
  source!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}
