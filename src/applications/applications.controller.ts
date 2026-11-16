import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApplicationResponseDto, CreateApplicationDto } from './application.dto';
import { ApplicationsService } from './applications.service';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Full job application from the application assistant' })
  @ApiCreatedResponse({ type: ApplicationResponseDto })
  create(@Body() dto: CreateApplicationDto): Promise<ApplicationResponseDto> {
    return this.applications.createFull(dto);
  }
}
