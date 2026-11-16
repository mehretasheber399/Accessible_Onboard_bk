import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGatewayApplicationDto {
  @ApiProperty({ example: 'Hana Bekele' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: '0911000000' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  phone!: string;

  @ApiProperty({ example: 'I helped customers at a campus desk.' })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  experience!: string;
}

export class CreateApplicationDto extends CreateGatewayApplicationDto {
  @ApiPropertyOptional({ example: 'customer-support-assistant' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  jobId?: string;

  @ApiProperty({ example: 'Customer Support Assistant' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  jobTitle!: string;

  @ApiProperty({ example: 'Selam Connect' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  employer!: string;

  @ApiPropertyOptional({ example: 'Secondary school' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  education?: string;

  @ApiPropertyOptional({ example: 'Clear writing' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  skills?: string;

  @ApiPropertyOptional({ example: 'hana-cv.docx' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  cvName?: string;
}

export class ApplicationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'OP-JOB-4821' })
  reference!: string;

  @ApiProperty({ nullable: true })
  jobId!: string | null;

  @ApiProperty()
  jobTitle!: string;

  @ApiProperty()
  employer!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty()
  experience!: string;

  @ApiProperty()
  education!: string;

  @ApiProperty()
  skills!: string;

  @ApiProperty()
  cvName!: string;

  @ApiProperty({ enum: ['gateway', 'full'] })
  kind!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}
